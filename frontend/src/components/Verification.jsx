import React, { useState, useEffect } from 'react';
import { Mail, Shield, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, habitsAPI, VerfyUser } from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function Verification() {
  const { user, logout } = useAuth();
  
  

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState('');
  const [User,setUser]=useState();

  useEffect(()=>{

   (async()=>{
     const res= await authAPI.getProfile()
    console.log(res);
    
     if(res){
      setUser(res?.user)
     }
     console.log(res)
   })()
    if(!user){
      navigate('/login')
    }
    

  },[])
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const sendOTP = async () => {
    if (!user?.email || !user.email.includes('@')) {
      setError('Valid email address enter karo');
      return;
    }
    
    setLoading(true);
    setError('');

    console.log(user);
    
    const res = await VerfyUser.sendOtp(user.id);

    if(res.status) {
      setLoading(false);
      setStep('otp');
      setTimer(300);
      console.log('OTP sent to:', user.email);
    }
  };

  const handleOTPInput = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name="otp-${index + 1}"]`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[name="otp-${index - 1}"]`);
      if (prevInput) prevInput.focus();
    }
  };

  const verifyOTP = async() => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Poora OTP enter karo');
      return;
    }
    
    setLoading(true);
    setError('');

    const res= await VerfyUser.VerifyOtp(user.id,otpString);
    
    if(res.status){
      toast.success('OTP VERIFIED')
      setLoading(false);
      setStep('success');
    }
    
  };

  const resendOTP = () => {
    setTimer(300);
    setOtp(['', '', '', '', '', '']);
    setError('');
    console.log('OTP resent to:', user.email);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetAll = () => {
    setStep('email');
    setOtp(['', '', '', '', '', '']);
    setError('');
    setTimer(0);
  };

  return (
    <div className="min-h-screen  bg-gradient-to-r from-black via-black/80  to-black flex items-center justify-center p-4">
        <header className='w-full px-4 py-2 '></header>
    { !User?.isVerified&&<div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        
        {step === 'email' && (
          <div className="text-center">
            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-blue-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Email Verify Karo</h1>
            <p className="text-gray-600 mb-4">Verification OTP bheja jayega:</p>
            <p className="text-blue-600 font-bold text-lg mb-8">{user?.email}</p>
            
            <div className="space-y-6">
              {error && (
                <div className="text-red-500 text-center font-medium">
                  {error}
                </div>
              )}
              
              <button
                onClick={sendOTP}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 text-lg"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>OTP Bhejo</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 'otp' && !isVerified(
          <div className="text-center">
            <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-purple-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">ENTER OTP</h1>
            <p className="text-gray-600 mb-2">Enter 6-digit code </p>
            <p className="text-purple-600 font-bold text-lg mb-8">{user?.email}</p>
            
            <div className="space-y-6">
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    name={`otp-${index}`}
                    value={digit}
                    onChange={(e) => handleOTPInput(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                    maxLength="1"
                  />
                ))}
              </div>
              
              {timer > 0 && (
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Code has been expired : {formatTime(timer)}</span>
                </div>
              )}
              
              {error && (
                <div className="text-red-500 text-center font-medium">
                  {error}
                </div>
              )}
              
              <button
                onClick={verifyOTP}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 rounded-lg transition-all duration-300 text-lg"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  'OTP Verify Karo'
                )}
              </button>
              
              <div className="text-center">
                {timer === 0 ? (
                  <button
                    onClick={resendOTP}
                    className="text-purple-600 hover:text-purple-800 font-bold underline"
                  >
                   Sent OTP
                  </button>
                ) : (
                  <p className="text-gray-500">
                   Resend OTP ? {formatTime(timer)}
                  </p>
                )}
              </div>
            </div>
            
          </div>
        )}

        {step === 'success' && (
          <div className="text-center">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <p className="text-gray-600 mb-8">Your email has been successfully verified</p>
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-8">
              <p className="text-green-800 font-medium">
                <strong>Verified Email:</strong> {user?.email}
              </p>
            </div>
          </div>
        )}
      </div>}

      {User?.isVerified&<div className='absolute top-50   flex rounded flex-col ' >
    <div className='w-90 h-40 bg-white/10 rounded-2xl flex justify-center items-center flex-col'> 
      <div>
        <span className='text-xl'>Your Mail</span><span className='bg-gradient-to-r text-2xl ml-2 bg-clip-text text-transparent from-red-500 font-bold via-purple-300 to-sky-400/50'>{user.email}</span>
      </div>
      <div className='flex flex-col justify-center items-center'>
        <span className='text-green-700 font-bold'>is Being Successfully Verified</span>

        <Link to='/dashboard' className='bg-green-500 p-2 rounded-2xl font-bold mt-5'>
        Dashboard
        </Link>
      </div>
    </div>
    
      </div>}
    </div>
  );
}