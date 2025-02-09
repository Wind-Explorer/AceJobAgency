export interface UserProfile {
  id: string;
  email: string;
  nationalRegistrationIdentityCardNumber: string;
  firstName: string;
  lastName: string;
  gender: number;
  password: string | undefined;
  dateOfBirth: string;
  whoAmI: string;
  resumeName: string;
}
