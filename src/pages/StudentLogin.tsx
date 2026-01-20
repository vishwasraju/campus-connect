import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

type Step = 'usn' | 'otp';

interface RegisteredUser {
  id: string;
  usn: string;
  name: string;
  phone: string;
  createdAt: string;
}

export default function StudentLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('usn');
  const [usn, setUsn] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!usn.trim()) {
      setError('Please enter your USN');
      return;
    }

    // Check if user is registered
    let existingUsers: RegisteredUser[] = JSON.parse(localStorage.getItem('nammavoice_users') || '[]');
    
    // Add demo user if not exists
    const demoUser: RegisteredUser = {
      id: 'demo-001',
      usn: '1RV21CS001',
      name: 'Demo Student',
      phone: '9876543210',
      createdAt: new Date().toISOString()
    };
    if (!existingUsers.some(u => u.usn === demoUser.usn)) {
      existingUsers.push(demoUser);
      localStorage.setItem('nammavoice_users', JSON.stringify(existingUsers));
    }
    
    const foundUser = existingUsers.find((u) => u.usn === usn.toUpperCase());
    
    if (!foundUser) {
      setError('USN not registered. Please signup first.');
      return;
    }

    setCurrentUser(foundUser);
    setIsLoading(true);
    
    // Generate OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setStep('otp');
    toast.success(`OTP sent to ****${foundUser.phone.slice(-4)}`);
    toast.info(`Demo OTP: ${newOtp}`, { duration: 10000 });
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    if (otp !== generatedOtp) {
      setError('Invalid OTP. Please try again.');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Login the user
    localStorage.setItem('nammavoice_user', JSON.stringify({
      id: currentUser?.id,
      studentId: currentUser?.usn,
      name: currentUser?.name,
      phone: currentUser?.phone,
      role: 'student'
    }));
    
    setIsLoading(false);
    toast.success('Login successful!');
    navigate('/feed');
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
            <CardTitle>Student Login</CardTitle>
            <CardDescription>
              {step === 'usn' 
                ? 'Enter your USN to receive an OTP'
                : 'Enter the OTP sent to your mobile'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'usn' ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="usn">USN (University Seat Number)</Label>
                  <Input
                    id="usn"
                    placeholder="e.g., 1RV21CS001"
                    value={usn}
                    onChange={(e) => setUsn(e.target.value.toUpperCase())}
                    className={error ? 'border-destructive' : ''}
                    disabled={isLoading}
                  />
                  {error && (
                    <p className="text-xs text-destructive">{error}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>One-Time Password</Label>
                    <button 
                      type="button" 
                      onClick={() => { setStep('usn'); setOtp(''); }}
                      className="text-xs text-primary hover:underline"
                    >
                      Change USN
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
                    OTP sent to ****{currentUser?.phone.slice(-4)}
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
                      Verify & Login
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
                  Resend OTP
                </Button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-border space-y-3 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Signup here
                </Link>
              </p>
              <p className="text-sm text-muted-foreground">
                Are you an admin?{' '}
                <Link to="/admin-login" className="text-primary hover:underline">
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
