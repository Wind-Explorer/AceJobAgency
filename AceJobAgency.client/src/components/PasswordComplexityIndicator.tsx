import { Card } from "@heroui/react";
import React from "react";

interface PasswordComplexityIndicatorProps {
  password: string;
}

const checkCriteria = (password: string) => ({
  isLongEnough: password.length >= 12,
  hasLowercase: /[a-z]/.test(password),
  hasUppercase: /[A-Z]/.test(password),
  hasNumber: /\d/.test(password),
  hasSpecialChar: /[^A-Za-z\d]/.test(password),
});

// Dot indicator component
const DotIndicator = ({ met }: { met: boolean }) => (
  <span
    className={`w-3 h-3 rounded-full ${met ? "bg-green-500" : "bg-red-500"}`}
  ></span>
);

// List item component
const CriteriaItem = ({ label, met }: { label: string; met: boolean }) => (
  <div className="flex items-center gap-2">
    <DotIndicator met={met} />
    <span className="text-sm opacity-50">{label}</span>
  </div>
);

// Main password complexity component
const PasswordComplexityIndicator: React.FC<
  PasswordComplexityIndicatorProps
> = ({ password }) => {
  const criteria = checkCriteria(password);

  const criteriaList = [
    { label: "12 characters", met: criteria.isLongEnough },
    { label: "Lowercase", met: criteria.hasLowercase },
    { label: "Uppercase", met: criteria.hasUppercase },
    { label: "Number", met: criteria.hasNumber },
    { label: "Special character", met: criteria.hasSpecialChar },
  ];

  return (
    <Card radius="sm" className="p-4 bg-neutral-500/10">
      <div className="grid grid-cols-2">
        {criteriaList.map((criterion, index) => (
          <CriteriaItem
            key={index}
            label={criterion.label}
            met={criterion.met}
          />
        ))}
      </div>
    </Card>
  );
};

export default PasswordComplexityIndicator;
