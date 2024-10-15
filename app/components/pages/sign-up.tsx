import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useNavigate } from '@remix-run/react';
import SignUpForm from '../organisms/SignUpForm/SignUpForm';
import ApplicationQNA from '../organisms/ApplicationQNA/ApplicationQNA';
import Footer from '../organisms/Footer/Footer';
import VerifyOTP from '../organisms/VerifyOTP/VerifyOTP';


export const SignUp: React.FC = () => {
    const navigate = useNavigate();
  const [showotp, setShowOtp] = useState(false);


    const handleLoginClick = () => {
      navigate('../login');
    };

  return (
    <div className="w-full">
      <div className="relative">
        <img src="/assets/images/banner.svg" alt="BANNER" className="w-full h-[200px] sm:h-[336px] object-cover" />
        <img src="/assets/images/lit-logo.svg" alt="LIT" className="absolute top-7 left-7 w-8 sm:w-16" />
      </div>
      {!showotp ? (
        <>
          <div className="w-full px-6 mt-8 sm:mt-14 justify-center items-center">
          <div className='max-w-[840px] mx-auto'>
            <div className="gap-4 sm:gap-6 flex flex-col text-center">
              <div className=" text-xl sm:text-3xl font-semibold ">Join the Education Revolution!</div>
              <div className=" text-sm sm:text-base font-semibold ">Register with us to begin your application process</div>
            </div>
            <SignUpForm setShowOtp={setShowOtp} />
            </div>
          </div>
          <ApplicationQNA />
          <Footer />
        </>) :
        (<VerifyOTP
          verificationType="email" // or "email"
          contactInfo="johndoe@gmail.com" // or an email address
          onSubmit={(otp) => console.log("OTP submitted:", otp)}
          onResend={() => console.log("OTP resend requested")}
          errorMessage="Oops! Looks like you got the OTP wrong, Please Retry."
        />)}

    </div>
  );
};

export default SignUp;
