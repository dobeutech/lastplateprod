import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { WASTE_CATEGORIES, ROOT_CAUSES, UNITS, WasteCategoryType, RootCauseType, UnitType } from '@/lib/waste-types';
import { useIntercomMessaging } from '@/lib/intercom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Camera, Check, Loader2 } from 'lucide-react';

export default function QuickLogWaste() {
  const { trackPageVisit, trackWasteLog } = useIntercomMessaging();
  const [category, setCategory] = useState<WasteCategoryType | ''>('');
  const [foodItem, setFoodItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<UnitType>('lbs');
  const [cost, setCost] = useState('');
  const [rootCause, setRootCause] = useState<RootCauseType | ''>('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Track page visit for proactive support
    trackPageVisit('Quick Log Waste');
  }, [trackPageVisit]);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !foodItem || !quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user from auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to log waste');
        return;
      }

      // Get user's location
      const { data: userData } = await supabase
        .from('users')
        .select('location_id')
        .eq('id', user.id)
        .single();

      if (!userData?.location_id) {
        toast.error('No location associated with your account');
        return;
      }

      let photoUrl = null;

      // Upload photo if provided
      if (photo) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('waste-photos')
          .upload(fileName, photo);

        if (uploadError) {
          console.error('Photo upload error:', uploadError);
        } else {
          photoUrl = data.path;
        }
      }

      // Insert waste log
      const { error } = await supabase.from('waste_logs').insert({
        location_id: userData.location_id,
        logged_by: user.id,
        waste_category: category,
        food_item: foodItem,
        quantity: parseFloat(quantity),
        unit,
        estimated_cost: cost ? parseFloat(cost) : null,
        photo_url: photoUrl,
        root_cause: rootCause || null,
        notes: notes || null,
      });

      if (error) {
        throw error;
      }

      // Track waste log event for Intercom analytics
      trackWasteLog(category, parseFloat(quantity));

      toast.success('Waste logged successfully!');
      
      // Reset form
      setCategory('');
      setFoodItem('');
      setQuantity('');
      setUnit('lbs');
      setCost('');
      setRootCause('');
      setNotes('');
      setPhoto(null);
      setPhotoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error logging waste:', error);
      toast.error('Failed to log waste. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const COMMON_ITEMS = [
    'Lettuce',
    'Tomatoes',
    'Chicken breast',
    'Ground beef',
    'Bread',
    'Milk',
    'Eggs',
    'Onions',
    'Potatoes',
    'Rice'
  ];

  return (
    <div className="min-h-screen bg-background p-4 pb-20 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Quick Log Waste
          </h1>
          <p className="text-muted-foreground mt-1">
            Target: Complete in &lt;30 seconds • SavePlate Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selection - Large touch targets */}
          <div>
            <Label htmlFor="category" className="text-base font-semibold mb-3 block">
              Waste Category *
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {WASTE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`p-4 rounded-lg border-2 text-center font-medium transition-all ${
                    category === cat
                      ? 'border-primary bg-primary text-primary-foreground shadow-lg'
                      : 'border-border bg-card text-foreground hover:border-primary/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Food Item - Quick select or type */}
          <div>
            <Label htmlFor="foodItem" className="text-base font-semibold mb-3 block">
              Food Item *
            </Label>
            <Input
              id="foodItem"
              value={foodItem}
              onChange={(e) => setFoodItem(e.target.value)}
              placeholder="Type or select below"
              className="h-14 text-base"
              required
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {COMMON_ITEMS.map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFoodItem(item)}
                  className="text-sm"
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity" className="text-base font-semibold mb-3 block">
                Quantity *
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.00"
                className="h-14 text-base"
                required
              />
            </div>
            <div>
              <Label htmlFor="unit" className="text-base font-semibold mb-3 block">
                Unit *
              </Label>
              <Select value={unit} onValueChange={(val) => setUnit(val as UnitType)}>
                <SelectTrigger className="h-14 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Photo Capture */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Photo (Optional)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoCapture}
              className="hidden"
            />
            {photoPreview ? (
              <div className="relative">
                <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setPhoto(null);
                    setPhotoPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2"
                >
                  Remove
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-dashed"
              >
                <Camera className="mr-2 h-6 w-6" />
                Tap to capture photo
              </Button>
            )}
          </div>

          {/* Estimated Cost */}
          <div>
            <Label htmlFor="cost" className="text-base font-semibold mb-3 block">
              Estimated Cost ($)
            </Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0.00"
              className="h-14 text-base"
            />
          </div>

          {/* Root Cause */}
          <div>
            <Label htmlFor="rootCause" className="text-base font-semibold mb-3 block">
              Root Cause
            </Label>
            <Select value={rootCause} onValueChange={(val) => setRootCause(val as RootCauseType)}>
              <SelectTrigger className="h-14 text-base">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {ROOT_CAUSES.map((cause) => (
                  <SelectItem key={cause} value={cause}>
                    {cause}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-base font-semibold mb-3 block">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional details..."
              className="min-h-24 text-base resize-none"
            />
          </div>

          {/* Submit Button - Large and prominent */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Logging...
              </>
            ) : (
              <>
                <Check className="mr-2 h-5 w-5" />
                Log Waste
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}