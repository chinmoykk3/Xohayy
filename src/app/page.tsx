import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export default function Home() {
  return (
    <div className="space-y-6">
      {/* Emergency Header Banner */}
      <section aria-labelledby="emergency-heading">
        <Card className="border-l-4 border-l-[var(--color-emergency-bg)] bg-[var(--color-bg-card)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-[var(--color-risk-danger-bg)] text-[var(--color-risk-danger-text)] border border-[var(--color-risk-danger-border)]">
                <Icon name="alert-triangle" size={16} />
                <span>Immediate Disaster Response</span>
              </span>
              <h1
                id="emergency-heading"
                className="text-2xl sm:text-3xl font-extrabold mt-2 text-[var(--color-text-main)]"
              >
                Emergency Assistance (PS05)
              </h1>
              <p className="text-base text-[var(--color-text-muted)] mt-1">
                Floods and landslide lifeline for Assam, Meghalaya, and North East communities.
              </p>
            </div>
            <a
              href="tel:112"
              className="w-full sm:w-auto inline-flex items-center justify-center min-h-[56px] min-w-[56px] px-6 py-3 rounded-[var(--radius-card)] bg-[var(--color-emergency-bg)] text-[var(--color-emergency-text)] hover:bg-[var(--color-emergency-hover)] font-black text-xl tracking-wide shadow-md transition-colors"
              aria-label="Call national emergency number 112"
            >
              <Icon name="phone" size={24} className="mr-2" />
              <span>Call 112</span>
            </a>
          </div>
        </Card>
      </section>

      {/* Action Quick Access Grid */}
      <section
        aria-labelledby="actions-heading"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <h2 id="actions-heading" className="sr-only">
          Quick Actions
        </h2>

        <Card as="article">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 rounded-full bg-[var(--color-risk-warning-bg)] text-[var(--color-risk-warning-text)]">
              <Icon name="warning" size={22} />
            </span>
            <h3 className="text-lg font-bold text-[var(--color-text-main)]">District Alerts</h3>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Check official flood levels, rain warnings, and road blockages for your district.
          </p>
          <Link href="/alerts" className="w-full block">
            <Button variant="primary" className="w-full">
              View Alerts
            </Button>
          </Link>
        </Card>

        <Card as="article">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 rounded-full bg-[var(--color-risk-watch-bg)] text-[var(--color-risk-watch-text)]">
              <Icon name="shield" size={22} />
            </span>
            <h3 className="text-lg font-bold text-[var(--color-text-main)]">Safety Guides</h3>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Step-by-step instructions for flash floods and landslide evacuation procedures.
          </p>
          <Link href="/guides" className="w-full block">
            <Button variant="secondary" className="w-full">
              Read Guides
            </Button>
          </Link>
        </Card>

        <Card as="article">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 rounded-full bg-[var(--color-risk-low-bg)] text-[var(--color-risk-low-text)]">
              <Icon name="map-pin" size={22} />
            </span>
            <h3 className="text-lg font-bold text-[var(--color-text-main)]">Relief Shelters</h3>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Find active shelter locations, relief camps, and nearest emergency hospitals.
          </p>
          <Link href="/shelters" className="w-full block">
            <Button variant="secondary" className="w-full">
              Find Shelters
            </Button>
          </Link>
        </Card>
      </section>
    </div>
  );
}
