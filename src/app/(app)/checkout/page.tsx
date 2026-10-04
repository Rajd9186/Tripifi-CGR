import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your booking with Tripifi CGR.",
};

export default function CheckoutPage() {
  return (
    <div className="pb-16">
      <section className="bg-navy-950 py-10">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white">
            Checkout
          </h1>
          <p className="mt-2 text-base text-white/80">
            Review your trip and complete your booking
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Trip Review">
              <div className="text-sm text-ink-600">
                Your journey details will appear here
              </div>
            </Card>

            <Card title="Traveller Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name" placeholder="John Doe" />
                <Input label="Email" type="email" placeholder="john@example.com" />
                <Input label="Phone Number" placeholder="+91 98765 43210" />
                <Input label="Date of Birth" type="date" />
              </div>
            </Card>

            <Card title="Payment Method">
              <p className="text-sm text-ink-600">
                Payment provider abstraction ready for integration
              </p>
              <div className="mt-4 space-y-2">
                <label className="flex items-center gap-2 p-3 border border-ink-100 rounded-lg cursor-pointer hover:bg-ink-50">
                  <input type="radio" name="payment" defaultChecked />
                  <span className="text-sm font-medium">UPI</span>
                </label>
                <label className="flex items-center gap-2 p-3 border border-ink-100 rounded-lg cursor-pointer hover:bg-ink-50">
                  <input type="radio" name="payment" />
                  <span className="text-sm font-medium">Credit/Debit Card</span>
                </label>
                <label className="flex items-center gap-2 p-3 border border-ink-100 rounded-lg cursor-pointer hover:bg-ink-50">
                  <input type="radio" name="payment" />
                  <span className="text-sm font-medium">Net Banking</span>
                </label>
              </div>
            </Card>
          </div>

          <div className="lg:sticky lg:top-24 h-fit">
            <Card title="Order Summary">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-600">Subtotal</span>
                  <span className="font-medium">₹0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-600">Taxes & Fees</span>
                  <span className="font-medium">₹0</span>
                </div>
                <div className="border-t border-ink-100 pt-2 mt-2 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold text-lg">₹0</span>
                </div>
              </div>
              <Button className="w-full justify-center mt-4">
                Complete Booking
              </Button>
              <p className="text-xs text-ink-500 mt-2 text-center">
                By completing this booking, you agree to our Terms & Conditions
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
