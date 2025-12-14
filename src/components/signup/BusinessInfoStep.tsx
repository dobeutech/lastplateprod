import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SignupFormData } from '@/pages/signup';
import { toast } from 'sonner';

interface BusinessInfoStepProps {
  formData: SignupFormData;
  updateFormData: (data: Partial<SignupFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const CUISINE_TYPES = [
  'American',
  'Italian',
  'Mexican',
  'Chinese',
  'Japanese',
  'Thai',
  'Indian',
  'Mediterranean',
  'French',
  'Korean',
  'Vietnamese',
  'Greek',
  'Spanish',
  'Middle Eastern',
  'Fusion',
  'Steakhouse',
  'Seafood',
  'Vegetarian',
  'Vegan',
  'Bakery',
  'Cafe',
  'Fast Casual',
  'Fine Dining',
  'Other',
];

const LOCATION_RANGES = ['1', '2-5', '6-10', '11-25', '26-50', '50+'];

export function BusinessInfoStep({ formData, updateFormData, onNext, onBack }: BusinessInfoStepProps) {
  const [firstName, setFirstName] = useState(formData.firstName);
  const [lastName, setLastName] = useState(formData.lastName);
  const [businessName, setBusinessName] = useState(formData.businessName);
  const [cuisineType, setCuisineType] = useState(formData.cuisineType);
  const [locationsCount, setLocationsCount] = useState(formData.locationsCount);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!cuisineType) newErrors.cuisineType = 'Please select a cuisine type';
    if (!locationsCount) newErrors.locationsCount = 'Please select number of locations';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateFormData({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      businessName: businessName.trim(),
      cuisineType,
      locationsCount,
    });

    toast.success('Business information saved');
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstName"
            type="text"
            placeholder="John"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setErrors(prev => ({ ...prev, firstName: undefined }));
            }}
            className={errors.firstName ? 'border-destructive' : ''}
          />
          {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              setErrors(prev => ({ ...prev, lastName: undefined }));
            }}
            className={errors.lastName ? 'border-destructive' : ''}
          />
          {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessName">
          Business Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="businessName"
          type="text"
          placeholder="Your Restaurant Name"
          value={businessName}
          onChange={(e) => {
            setBusinessName(e.target.value);
            setErrors(prev => ({ ...prev, businessName: undefined }));
          }}
          className={errors.businessName ? 'border-destructive' : ''}
        />
        {errors.businessName && <p className="text-sm text-destructive">{errors.businessName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cuisineType">
          Cuisine Type <span className="text-destructive">*</span>
        </Label>
        <Select
          value={cuisineType}
          onValueChange={(value) => {
            setCuisineType(value);
            setErrors(prev => ({ ...prev, cuisineType: undefined }));
          }}
        >
          <SelectTrigger className={errors.cuisineType ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select cuisine type" />
          </SelectTrigger>
          <SelectContent>
            {CUISINE_TYPES.map((type) => (
              <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, '_')}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.cuisineType && <p className="text-sm text-destructive">{errors.cuisineType}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="locationsCount">
          Number of Locations <span className="text-destructive">*</span>
        </Label>
        <Select
          value={locationsCount}
          onValueChange={(value) => {
            setLocationsCount(value);
            setErrors(prev => ({ ...prev, locationsCount: undefined }));
          }}
        >
          <SelectTrigger className={errors.locationsCount ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select location count" />
          </SelectTrigger>
          <SelectContent>
            {LOCATION_RANGES.map((range) => (
              <SelectItem key={range} value={range}>
                {range} {range === '1' ? 'location' : 'locations'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.locationsCount && <p className="text-sm text-destructive">{errors.locationsCount}</p>}
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" className="flex-1">
          Continue
        </Button>
      </div>
    </form>
  );
}
