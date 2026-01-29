import { useState, useRef, DragEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, CheckCircle, Upload, Camera, Wand2, Edit3, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = "http://localhost:3000/auth";
type Step = 'method' | 'upload' | 'details' | 'otp';
type Method = 'autodetect' | 'manual';

interface StudentData {
  usn: string;
  name: string;
  phone: string;
  countryCode: string;
  email: string
}

const countryCodes = [
  { code: '+91', country: 'IN', flag: '🇮🇳' },
];

export default function StudentSignup() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<Step>('method');
  const [method, setMethod] = useState<Method | null>(null);
  const [idCardImage, setIdCardImage] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<StudentData>({ usn: '', name: '', phone: '', countryCode: '+91', email: '' });
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [resendOTPTimer, setResendOTPTimer] = useState(10);

  const handleMethodSelect = (selectedMethod: Method) => {
    setMethod(selectedMethod);
    setStep('upload');
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setIdCardImage(event.target?.result as string);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const simulateOCR = (): StudentData => {
    // Simulate OCR extraction with realistic mock data
    const mockUSNs = ['1RV21CS001', '1RV21EC045', '1RV22ME032', '1RV21IS078', '1RV22CV015'];
    const mockNames = ['Rahul Kumar', 'Priya Sharma', 'Amit Singh', 'Sneha Reddy', 'Karthik Gowda'];
    const mockPhones = ['9876543210', '9845123456', '9901234567', '9988776655', '9123456789'];
    
    const index = Math.floor(Math.random() * mockUSNs.length);
    return {
      usn: mockUSNs[index],
      name: mockNames[index],
      phone: mockPhones[index],
      countryCode: '+91',
      email: ''
    };
  };

  const handleProcessIdCard = async () => {
    if (!idCardImage) {
      setError('Please upload your ID card');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (method === 'autodetect') {
      const extractedData = simulateOCR();
      setStudentData(extractedData);
      toast.success('Details extracted successfully!');
    }
    
    setIsLoading(false);
    setStep('details');
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log("This is the student Data: ", studentData);

    if (!studentData.usn.trim()) {
      setError('Please enter your USN');
      return;
    }
    if (!studentData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!studentData.phone.trim() || studentData.phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);

    try{

        const res = await fetch(`${API_BASE}/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({studentID: studentData.usn, name: studentData.name, phone: studentData.phone, email: studentData.email})
        });

        const data = await res.json();

        if(!res.ok){
            throw new Error(data.message || "Cannot signup you up for now")
        }

        toast.success(`OTP sent to ${studentData.email}`);
        setStep('otp');

    } catch(err: any){
        setError(err.message);
    } finally{
        setIsLoading(false);
    }

  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    // if (otp !== generatedOtp) {
    //   setError('Invalid OTP. Please try again.');
    //   return;
    // }

    setIsLoading(true);

    try{

        const res = await fetch(`${API_BASE}/signup/verify-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({studentID: studentData.usn, otp: otp, email: studentData.email})
        });

        const data = await res.json();

        if(!res.ok){
            throw new Error(data.message || "Unable to verify OTP")
        }

        toast.success('Account created successfully!');
        setTimeout(() => {
            navigate('/login', { replace: true });
        }, 500);

    } catch(err: any){
        setError(err.message);
    } finally{
        setIsLoading(false);
    }

    // Save user to localStorage
    // const existingUsers = JSON.parse(localStorage.getItem('nammavoice_users') || '[]');
    // existingUsers.push({
    //   ...studentData,
    //   id: Date.now().toString(),
    //   createdAt: new Date().toISOString()
    // });
    // localStorage.setItem('nammavoice_users', JSON.stringify(existingUsers));

    // // Login the user
    // localStorage.setItem('nammavoice_user', JSON.stringify({
    //   id: Date.now().toString(),
    //   studentId: studentData.usn,
    //   name: studentData.name,
    //   phone: studentData.phone,
    //   role: 'student'
    // }));

  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              NV
            </div>
            <CardTitle>Student Signup</CardTitle>
            <CardDescription>
              {step === 'method' && 'Choose how you want to register'}
              {step === 'upload' && 'Upload your college ID card'}
              {step === 'details' && 'Verify your details'}
              {step === 'otp' && 'Enter the OTP sent to your mobile'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'method' && (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => handleMethodSelect('autodetect')}
                >
                  <Wand2 className="h-6 w-6 text-primary" />
                  <span className="font-semibold">Auto-detect from ID Card</span>
                  <span className="text-xs text-muted-foreground">
                    We'll extract your USN, name & phone automatically
                  </span>
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => handleMethodSelect('manual')}
                >
                  <Edit3 className="h-6 w-6 text-primary" />
                  <span className="font-semibold">Enter Details Manually</span>
                  <span className="text-xs text-muted-foreground">
                    Upload ID card for verification, enter details yourself
                  </span>
                </Button>
              </div>
            )}

            {step === 'upload' && (
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {idCardImage ? (
                  <div className="space-y-3">
                    <div className="relative rounded-lg overflow-hidden border border-border">
                      <img 
                        src={idCardImage} 
                        alt="ID Card" 
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Retake Photo
                    </Button>
                  </div>
                ) : (
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragging 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className={`h-10 w-10 mx-auto mb-3 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="text-sm font-medium">
                      {isDragging ? 'Drop your ID card here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG or take a photo using camera
                    </p>
                  </div>
                )}

                {error && (
                  <p className="text-xs text-destructive text-center">{error}</p>
                )}

                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => { setStep('method'); setIdCardImage(null); }}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={handleProcessIdCard}
                    disabled={!idCardImage || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {method === 'autodetect' ? 'Extracting...' : 'Processing...'}
                      </>
                    ) : (
                      'Continue'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {step === 'details' && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="usn">USN (University Seat Number)</Label>
                  <Input
                    id="usn"
                    placeholder="e.g., 1RV21CS001"
                    value={studentData.usn}
                    onChange={(e) => setStudentData({ ...studentData, usn: e.target.value.toUpperCase() })}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="e.g., rohangogale@gmail.com"
                    value={studentData.email}
                    onChange={(e) => setStudentData({ ...studentData, email: e.target.value})}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Rahul Kumar"
                    value={studentData.name}
                    onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <Select
                      value={studentData.countryCode}
                      onValueChange={(value) => setStudentData({ ...studentData, countryCode: value })}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue>
                          {countryCodes.find(c => c.code === studentData.countryCode)?.flag} {studentData.countryCode}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {countryCodes.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.flag} {country.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="e.g., 9876543210"
                      className="flex-1"
                      value={studentData.phone}
                      onChange={(e) => setStudentData({ ...studentData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-destructive">{error}</p>
                )}

                {method === 'autodetect' && (
                  <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    ✨ Details auto-filled from your ID card. Please verify and correct if needed.
                  </p>
                )}

                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant="ghost" 
                    onClick={() => setStep('upload')}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      'Send OTP'
                    )}
                  </Button>
                </div>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>One-Time Password</Label>
                    <button 
                      type="button" 
                      onClick={() => setStep('details')}
                      className="text-xs text-primary hover:underline"
                    >
                      Change Details
                    </button>
                  </div>
                  <div className="flex justify-center py-2">
                    <InputOTP 
                      maxLength={6} 
                      value={otp} 
                      onChange={setOtp}
                      disabled={isLoading}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {error && (
                    <p className="text-xs text-destructive text-center">{error}</p>
                  )}
                  <p className="text-xs text-muted-foreground text-center">
                    OTP sent to ****{studentData.phone.slice(-4)}
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify & Create Account
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => {
                    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
                    setGeneratedOtp(newOtp);
                    toast.info(`New Demo OTP: ${newOtp}`, { duration: 10000 });
                  }}
                  disabled={isLoading}
                >
                  Resend OTP {resendOTPTimer}
                </Button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Login here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}