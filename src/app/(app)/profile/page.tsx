import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your Tripifi CGR profile and preferences.",
};

export default function ProfilePage() {
  return (
    <div className="pb-16">
      <section className="bg-navy-950 py-10">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white">
            Profile
          </h1>
          <p className="mt-2 text-base text-white/80">
            Manage your account, travellers and preferences
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card padding="md">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-navy-900 text-white flex items-center justify-center text-xl font-semibold">
                AS
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-ink-900">Aarav Sharma</h2>
                <p className="text-sm text-ink-600">aarav@yatraa.in</p>
                <div className="mt-2">
                  <Badge variant="info">Tripifi CGR Member</Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Edit Profile
              </Button>
            </div>
          </Card>

          <Card title="Travel Preferences">
            <div className="flex flex-wrap gap-2">
              {["Mountains", "Beaches", "Food", "Culture", "Adventure", "Nature"].map(
                (pref) => (
                  <Badge key={pref} variant="default">
                    {pref}
                  </Badge>
                )
              )}
            </div>
          </Card>

          <Card title="Saved Travellers">
            <p className="text-sm text-ink-600">
              Manage traveller details for faster bookings
            </p>
            <div className="mt-4">
              <Button variant="ghost" size="sm">
                + Add Traveller
              </Button>
            </div>
          </Card>

          <Card title="Documents">
            <p className="text-sm text-ink-600">
              Store your travel documents securely
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
