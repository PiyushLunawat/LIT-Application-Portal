import React, { useEffect, useState } from 'react';
import { getCentres, getCohorts, getPrograms } from '~/utils/api';
import { AlertCircle, CalendarIcon, Mail, Phone } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { useNavigate } from '@remix-run/react';
import { Popover, PopoverTrigger, PopoverContent } from '~/components/ui/popover';
import { Calendar } from '~/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { format } from 'date-fns';
import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUp } from '~/utils/authAPI';


interface Program {
  _id: string;
  name: string;
  description: string;
  duration: number;
  prefix: string;
  status: boolean;
}
interface Cohort {
  _id: string;
  cohortId: string;
  programDetail: string;
  centerDetail: string;
  startDate: string;
  endDate: string;
  schedule: string;
  totalSeats: number;
  timeSlot: string;
  filled: number;
  status: string;
  baseFee: string;
  isComplete: boolean;
}

const formSchema = z.object({
  firstName: z.string().nonempty("First name is required"),
  lastName: z.string().nonempty("Last name is required"),
  email: z.string().email("Invalid email address"),
  mobileNumber: z.string().min(10, "Contact No. should be 10 digits"),
  dateOfBirth: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      return new Date(arg);
    }
  }, z.date().max(new Date(new Date().setFullYear(new Date().getFullYear() - 16)), "You must be at least 16 years old")),
  qualification: z.string().nonempty("Qualification is required"),
  program: z.string().nonempty("Please select a program"),
  cohort: z.string().nonempty("Please select a cohort"),
  password: z.string().nonempty("Please select a cohort"),
});

type FormValues = z.infer<typeof formSchema>;

interface SignUpFormProps {
  setShowOtp: React.Dispatch<React.SetStateAction<boolean>>;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ setShowOtp, setEmail }) => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [programs, setPrograms] = useState<Program[]>([]);  
  const [centres, setCentres] = useState<any[]>([]);
  const [interest, setInterest] = useState<Cohort[]>([]);  
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [selectedCentre, setSelectedCentre] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      mobileNumber: '',
      dateOfBirth: undefined,
      qualification: '',
      program: '',
      cohort: '',
      password: 'hi',
    },
  });
  
  const {  formState: { errors }, setError, control } = form;

  useEffect(() => {
    async function fetchData() {
      try {
        const cohortsData = await getCohorts();
        const programsData = await getPrograms();
        setPrograms(programsData.data);
        const centresData = await getCentres();
        setCentres(centresData.data);
        const openCohorts = cohortsData.data.filter((cohort:Cohort) => cohort.status === "Open");
        setInterest(openCohorts);
        setCohorts(cohortsData.data);
      } catch (error) {
        console.error("Error fetching programs:", error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    // Filter cohorts by selected program
    if (form.watch("program")) {
      const filteredCohorts = interest.filter(
        (cohort) => cohort.programDetail === form.watch("program")
      );
      setCohorts(filteredCohorts);
    }
  }, [form.watch("program"), interest]);

  const getProgramName = (programId: string) => {
    const program = programs.find((p) => p._id === programId);
    return program ? program.name : "Unknown Program";
  };

  const getCenterName = (centerId: string) => {
    const center = centres.find((c) => c._id === centerId);
    return center ? center.name : "--";
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setLoading(true);

      const transformedData = {
        ...data,
        dateOfBirth: data.dateOfBirth.toISOString().split("T")[0], // ISO format (YYYY-MM-DD)
      };

      console.log("Transformed Data:", transformedData);

      const response = await signUp(transformedData);
      console.log("Response from Sign-Up:", response);

      setEmail(data.email);
      setShowOtp(true);
    } catch (error: any) {
      setError('email', {
        type: 'manual', 
        message: error.message || 'An unexpected error occurred', // Display the error message
      });
      console.log("Sign-up failed efaefa",error)
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      form.setValue("dateOfBirth", selectedDate); // Store Date object
    }
  };
  
  function formatDateToMonthYear(dateString: string): string {
    const date = new Date(dateString);
    return format(date, "MMMM, yyyy");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 px-4">
        <div className="grid sm:grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1 relative">
                <Label className="text-sm font-normal pl-3">First Name</Label>
                <Input placeholder="John" {...field} />
                <FormMessage className="text-sm font-normal pl-3"/>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1 relative">
                <Label className="text-sm font-normal pl-3">Last Name</Label>
                <Input placeholder="Doe" {...field} />
                <FormMessage className="text-sm font-normal pl-3"/>
              </FormItem>
            )}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1 relative">
                <Label className="text-sm font-normal pl-3">Email</Label>
                <Input placeholder="johndoe@gmail.com" {...field} />
                <Mail className="absolute right-3 top-[46px] w-5 h-5" />
                <FormMessage className="text-sm font-normal pl-3"/>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mobileNumber"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1 relative">
                <Label className="text-sm font-normal pl-3">Contact No.</Label>
                <Input  type="tel" maxLength={14}
        placeholder="+91 00000 00000"
        {...field}
        onFocus={(e) => {
          if (!field.value) {
            field.onChange('+91 ');
          }
        }}
        onChange={(e) => {
          let value = e.target.value;
          // Remove all non-numeric characters, but allow "+91" at the beginning
          if (value.startsWith('+91 ')) {
            value = '+91 ' + value.slice(4).replace(/\D/g, ''); // Retain only digits after +91
          } else {
            value = value.replace(/[^0-9+\s]/g, ''); // For any other input, retain only digits
          }
          field.onChange(value);
        }}/>
                <Phone className="absolute right-3 top-[46px] w-5 h-5" />
                <FormMessage className="text-sm font-normal pl-3"/>
              </FormItem>
            )}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-2">
        <FormField
  control={form.control}
  name="dateOfBirth"
  render={({ field }) => {
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 16); // Subtract 16 years from today's date
    const maxDateString = maxDate.toISOString().split('T')[0];
    return (
      <FormItem className="flex-1 flex flex-col space-y-1 relative">
        <FormLabel className="text-sm font-normal pl-3">Date of Birth</FormLabel>
        <input
          type="date"
          className="!h-[64px] bg-[#09090B] px-3 rounded-xl border"
          id="dateOfBirth"
          name="dateOfBirth"
          value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
          onChange={(e) => {
            const date = e.target.value;
            field.onChange(date);
          }}
          max={maxDateString}
        />
        <FormMessage className="text-sm font-normal pl-3" />
      </FormItem>
    );
  }}
/>

          <FormField
            control={form.control}
            name="qualification"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-1 relative">
                <Label className="text-sm font-normal pl-3">Qualification</Label>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="CollegeGraduate">College Graduate</SelectItem>
                    <SelectItem value="WorkingProfessional">Working Professional</SelectItem>
                    <SelectItem value="Freelancer">Freelancer</SelectItem>
                    <SelectItem value="BusinessOwner">Business Owner</SelectItem>
                    <SelectItem value="Consultant">Consultant</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-sm font-normal pl-3"/>
              </FormItem>
            )}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-2">
        <FormField
          control={form.control}
          name="program"
          render={({ field }) => (
            <FormItem className="flex-1 space-y-1 relative">
              <Label className="text-sm font-normal pl-3">Course of Interest</Label>
              <Select onValueChange={(value) => { field.onChange(value); (value); }} defaultValue={field.value} >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                {Array.from(new Map(interest.map((int) => [int.programDetail, int])).values()).map((int) => (
                  <SelectItem key={int.programDetail} value={int.programDetail}>
                    {getProgramName(int.programDetail)}
                  </SelectItem>
                ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-sm font-normal pl-3"/>
              <Label htmlFor="form-alert" className='flex gap-1 items-center text-sm text-[#00A3FF] font-normal mt-1 pl-3'>
                Your application form will be in line with the course of your choice.
              </Label>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cohort"
          render={({ field }) => (
            <FormItem className="flex-1 space-y-1 relative">
              <Label className="text-sm font-normal pl-3">Select Cohort</Label>
              <Select onValueChange={(value) => { field.onChange(value); (value); }} defaultValue={field.value} disabled={!form.watch("program")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {cohorts.map((cohort) => (
                    <SelectItem key={cohort._id} value={cohort._id}>{formatDateToMonthYear(cohort.startDate)} ({cohort.timeSlot}), {getCenterName(cohort?.centerDetail)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-sm font-normal pl-3"/>
            </FormItem>
          )}
        />
        </div>

        <div className="flex gap-2 mt-6">
          <Button type="button" onClick={() => navigate('../login')} size="xl" variant="ghost">
            Login to Dashboard
          </Button>
          <Button type="submit" size="xl" className='flex-1' disabled={loading}>
            {loading ? 'Sending OTP...' : 'Verify Account'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SignUpForm;
