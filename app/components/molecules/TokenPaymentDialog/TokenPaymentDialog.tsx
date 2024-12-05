import * as React from 'react';
import { Dialog, DialogContent } from '~/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'; 
import { Button } from '~/components/ui/button'; 
import { Label } from '~/components/ui/label';
import { ArrowLeft, Pencil, X } from 'lucide-react';
import ImageUpload from '~/components/ui/ImageUpload';
import { useNavigate } from '@remix-run/react';
import { useState } from 'react';

interface TokenPaymentDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TokenPaymentDialog: React.FC<TokenPaymentDialogProps> = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState<'cash' | 'bank transfer'>('cash');
  const [secondDialogOpen, setSecondDialogOpen] = useState(false);

  const handleNextClick = () => {
    setSecondDialogOpen(true); // Open the second dialog when "Next" is clicked
  };

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null); // State for the uploaded file
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();

      // Preview image
      reader.onload = (e) => {
        if (e.target?.result) {
          setSelectedImage(e.target.result as string);
        }
      };

      reader.readAsDataURL(file);
      setReceiptFile(file); // Store the selected file for upload
    }
  };

  const handleDeleteImage = () => {
    setSelectedImage(null); // Remove the image preview
    setReceiptFile(null); // Remove the file from state
  };

  const handleEditImage = () => {
    document.getElementById('image-upload')?.click();
  };

  const handleSubmitImage = async () => {
    if (!receiptFile) {
      alert('Please upload a receipt image.');
      return;
    }

    setUploadError(null)

    const formData = new FormData();
    formData.append('paymentType', selectedPayment); // Add paymentType to formData
    formData.append('receipt', receiptFile); // Add receipt image file to formData

    try {
      setLoading(true);
      console.log("tis",selectedPayment,receiptFile);
      

      const response = await fetch('http://localhost:4000/student/token-receipt', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload receipt');
      }

      const data = await response.json();
      console.log('Receipt uploaded successfully:', data);
      navigate('../dashboard');
    } catch (error) {
      setUploadError('Error uploading receipt. Please try again.');
      console.error('Error uploading receipt:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
  <>  
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl mx-4 bg-[#09090b] text-white rounded-lg px-8 py-8 text-center shadow-[0px_4px_32px_0px_rgba(0,0,0,0.75)]">
        <div className="flex justify-center mb-6">
          <img src='/assets/images/lit-cash-icon.svg' className="w-[60px]" />
        </div>
        
        <div className="text-base font-medium ">STEP 01</div>
        <div className="text-3xl font-semibold mb-4">Select Payment Mode</div>

        {/* Radio Group for Payment Selection */}
        <RadioGroup
          className="flex flex-col gap-4"
          value={selectedPayment}
          onValueChange={(value) => setSelectedPayment(value as 'cash' | 'bank transfer')}
        >
          {/* Cash Payment Option */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className='text-2xl'>Cash</Label>
            </div>
              <div className="text-base text-muted-foreground text-start">
                You may make a cash payment in person, following which you will receive a receipt. On uploading a soft copy of the receipt on the portal you will be able to access your dashboard.
              </div>
          </div>

          {/* Bank Transfer Payment Option */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="bank-transfer" id="bank-transfer" />
              <Label htmlFor="bank-transfer" className='text-2xl'>Bank Transfer</Label>
            </div>
              <div className="text-base text-muted-foreground text-start">
                You will be provided LIT School’s bank account details. You may make a NEFT transaction to the same account. Once you have made a transaction please upload an acknowledgement receipt.
              </div>
          </div>
        </RadioGroup>

        {/* Next Button */}
        <Button size="xl" variant="outline" className="mt-8 w-fit border-[#00CC92] text-[#00CC92] mx-auto" onClick={handleNextClick}>Next</Button>
      </DialogContent>
    </Dialog>
    <Dialog open={secondDialogOpen} onOpenChange={setSecondDialogOpen}>
        <DialogContent className="max-w-2xl mx-4 bg-[#09090b] text-white rounded-lg px-8 py-8 text-center shadow-[0px_4px_32px_0px_rgba(0,0,0,0.75)] h-[600px] overflow-hidden overflow-y-auto">
          <ArrowLeft className='w-6 h-6 cursor-pointer absolute top-10 left-8' onClick={() => setSecondDialogOpen(false)} />
          <div className="flex justify-center mb-6">
            <img src='/assets/images/lit-cash-icon.svg' className="w-[60px]" />
          </div>
        
          <div className="text-base font-medium ">STEP 02</div>
        <div className="text-3xl font-semibold mb-4">Upload your Payment Receipt</div>

          {/* Conditional Rendering Based on Selected Payment Method */}
          <RadioGroup>{selectedPayment === 'cash' ? (
            <>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="cash" id="cash" checked />
                  <Label htmlFor="cash" className='text-2xl'>Cash</Label>
                </div>
                <div className="text-base text-muted-foreground text-start">
                  Uploading a soft copy of the acknowledgement receipt issued to you by our fee manager to access your dashboard.
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="bank-transfer" id="bank-transfer" checked />
                  <Label htmlFor="bank-transfer" className='text-2xl'>Bank Transfer</Label>
                </div>
                <div className=" text-start">
                  <div className="flex justify-start gap-2 mt-4 p-4 border border-[#2C2C2C] rounded-md">
                    <div className="flex flex-col text-left">
                      <p className='text-base'>LITschool</p>
                      <p className='text-sm'>Account No.: 123456789</p>
                      <p className='text-sm'>IFS Code: ABCD0001234</p>
                      <p className='text-sm'>Branch: Sadashivnagar</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Uploading a soft copy of the acknowledgement receipt issued to you by our fee manager to access your dashboard.
                  </p>
                </div>
              </div>
            </>
          )}</RadioGroup>
          <div className="flex flex-col items-center">
      {selectedImage ? (
        <div className="relative bg-[#64748B33] rounded-xl border border-[#2C2C2C] w-full h-[220px]">
          <img
            src={selectedImage}
            alt="Uploaded receipt"
            className="mx-auto h-full  "
          />

          <div className="absolute top-3 right-3 flex space-x-2">
            <Button variant="outline" size="icon"
              className="w-8 h-8 bg-white/[0.2] border border-white rounded-full shadow hover:bg-white/[0.4]"
              onClick={handleEditImage}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon"
              className="w-8 h-8 bg-white/[0.2] border border-white rounded-full shadow hover:bg-white/[0.4]"
              onClick={handleDeleteImage}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      ) : (
        <label
          htmlFor="image-upload"
          className="cursor-pointer flex flex-col items-center justify-center bg-[#64748B33] p-4 rounded-xl border-[#2C2C2C] w-full h-[220px]"
        >
          <div className="flex flex-col items-center space-y-3">
            <img
              src="/assets/images/receipt-icon.svg"
              alt="Upload icon"
              className="w-14 h-14"
            />
            <p className="text-sm">Upload your Acknowledgement Receipt</p>
          </div>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>
      )}
    </div>

          {/* Submit Button */}
          <Button size="xl" variant="outline"
            className="mt-8 w-fit border-[#00CC92] text-[#00CC92] mx-auto" 
            onClick={handleSubmitImage} disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</Button>
        </DialogContent>
      </Dialog>
  </>

  );
};

export default TokenPaymentDialog;
