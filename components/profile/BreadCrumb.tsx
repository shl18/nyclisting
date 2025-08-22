import React from "react";
import { ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  items: {
    label: string;
    href?: string;
  }[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center text-sm mb-4">
      {items.map((item, index) => (
        <React.Fragment key={item.label}>
          {index > 0 && <ChevronRight className="mx-2 w-4 h-4 text-gray-400" />}

          {item.href ? (
            <a
              href={item.href}
              className={
                index === items.length - 1
                  ? "text-primary font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }
            >
              {item.label}
            </a>
          ) : (
            <span
              className={
                index === items.length - 1
                  ? "text-primary font-medium"
                  : "text-gray-500"
              }
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
