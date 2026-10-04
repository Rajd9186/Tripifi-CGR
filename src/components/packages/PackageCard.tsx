import Link from "next/link";
import Badge from "@/components/ui/Badge";

export interface Package {
  slug: string;
  title: string;
  route: string;
  duration: string;
  price: number;
  image: string;
  tags: string[];
  highlights: string[];
  inclusions: string[];
}

interface PackageCardProps {
  pkg: Package;
}

export default function PackageCard({ pkg }: PackageCardProps) {
  return (
    <Link
      href={`/packages/${pkg.slug}`}
      className="card group flex flex-col overflow-hidden h-full"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={pkg.image}
          alt={pkg.title}
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display text-lg font-semibold text-ink-900">
          {pkg.title}
        </h3>
        <p className="text-sm text-ink-600 mt-1 line-clamp-1">{pkg.route}</p>
        <div className="text-sm text-ink-600 mt-1">{pkg.duration}</div>

        <div className="mt-3 flex flex-wrap gap-1">
          {pkg.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="default">
              {tag}
            </Badge>
          ))}
        </div>

        <ul className="mt-3 space-y-1 flex-1">
          {pkg.highlights.slice(0, 3).map((highlight) => (
            <li key={highlight} className="flex items-start gap-2 text-xs text-ink-600">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-leaf-600 mt-0.5 flex-shrink-0"
              >
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              <span className="line-clamp-1">{highlight}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 pt-4 border-t border-ink-100 flex items-end justify-between">
          <div>
            <span className="text-xs text-ink-500">Starting from</span>
            <div className="text-xl font-semibold text-ink-900">
              ₹{pkg.price.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-ink-500">per person</div>
          </div>
          <span className="btn-ghost px-3 py-2 text-sm group-hover:border-navy-300 group-hover:bg-navy-50">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
}
