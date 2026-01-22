import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { isAuthenticated } from './auth';

const API_BASE = "http://localhost:3000/auth";


type Step = 'studentId' | 'otp';

export default function StudentLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('studentId');
  const [studentId, setStudentId] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendOTPTimer, setResendOTPTimer] = useState(10);

  useEffect(() => {
    return isAuthenticated() ? navigate("/feed") : console.log("User not logged in");
  });

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!studentId.trim()) {
      setError('Please enter your Student ID');
      return;
    }

    if (studentId.length < 3) {
      setError('Please enter a valid Student ID');
      return;
    }

    setIsLoading(true);
    
    try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ "studentID": studentId}),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to send OTP");
    }

    toast.success("OTP sent to your registered email");
    setStep("otp");

  } catch (err: any) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }

  };

  useEffect(() => {
  if (step !== 'otp') return;
  if (resendOTPTimer <= 0) return;

  const interval = setInterval(() => {
    setResendOTPTimer(prev => prev - 1);
  }, 1000);

  return () => clearInterval(interval);
}, [step, resendOTPTimer]);



  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    console.log(JSON.stringify({"studentID":studentId, "otp": otp}));

    setIsLoading(true);

    try{

      const res = await fetch(`${API_BASE}/login/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({"studentID": studentId, "otp": otp})
      });

      const data = await res.json();
      console.log(data);

      if(!res.ok){
        throw new Error(data.message || "Failed to verify OTP");
      }

      localStorage.setItem('token', data.token);


      localStorage.setItem(
        "campusVoice-user",
        JSON.stringify({
          name: data.name,
          studentID: studentId,
          role: data.role,
        })
      );

      toast.success('Login successful');
      navigate('/feed');

    } catch(err: any){
        setError(err.message);
    } finally{
        setIsLoading(false);
    }
  };

  const handleResendOTP = () => {
    setResendOTPTimer(10);
    console.log("Resend OTP is asked.");
  }

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
              {step === 'studentId' 
                ? 'Enter your Student ID to receive an OTP'
                : 'Enter the OTP sent to your mobile'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'studentId' ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    placeholder="e.g., STU2024001"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value.toUpperCase())}
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
                      onClick={() => setStep('studentId')}
                      className="text-xs text-primary hover:underline"
                    >
                      Change Student ID
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
                    OTP sent to mobile ending in ****1234
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
                  onClick={() => {toast.info('OTP resent!'); handleResendOTP();}}
                  disabled={resendOTPTimer > 0 || isLoading}
                >
                  {resendOTPTimer > 0
                    ? `Resend OTP in ${resendOTPTimer}s` :
                    'Resend OTP'
                  }
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

        <p className="text-xs text-muted-foreground text-center mt-4">
          For demo: Enter any Student ID and use any 6-digit OTP
        </p>
      </div>
    </div>
  );
}
