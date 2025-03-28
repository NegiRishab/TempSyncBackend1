export enum STATUS {
  active = 'active',
  inactive = 'inactive',
  verified = 'verified',
}

export enum VERIFICATION_CODE_TYPES {
  DEFAULT,
  FORGOT_PASSWORD,
  VERIFY_EMAIL,
}

export enum EventCategoryEnum {
  podium = 'podium',
  marquee = 'marquee',
  summit = 'summit',
  departmental = 'departmental',
  wedding = 'wedding',
}

export enum ContactTypesEnum {
  speaker = 'speaker',
  sponsor = 'sponsor',
  moderator = 'moderator',
  staff = 'staff',
  partner = 'partner',
  attendee = 'attendee',
  client = 'client',
  vendor = 'vendor',
  other = 'other',
}

export enum CompanyTypesEnum {
  vendor = 'vendor',
  sponsor = 'sponsor',
  partner = 'partner',
}

export enum CompanySponsorTypesEnum { // sub category of company type Sponsor
  partner = 'partner',
  principal = 'principal',
  in_kind = 'in_kind',
  presenting = 'presenting',
}

export enum CompanyVendorTypesEnum { // sub category of company type Vendor
  production = 'production',
  artist = 'artist',
  dj = 'dj',
  catering = 'catering',
}

export enum EventStatusEnum {
  draft = 'draft',
  active = 'active',
  completed = 'completed',
  cancelled = 'cancelled',
  pre_event = 'pre_event',
  live = 'live',
  sold_out = 'sold_out',
}

export enum EventInvitationTypeEnum {
  manual = 'manual',
  auto = 'auto',
}

export enum SortingDirectionEnum {
  asc = 'ASC',
  desc = 'DESC',
}

export enum EventAgendaType {
  session,
  agenda,
}

export enum AgendaAssigneesType {
  speaker,
  moderator,
}

export enum QuestionTypeEnum {
  text,
  number,
  date,
  radio,
  checkbox,
  dropdown,
}

export enum QuestionStatusEnum {
  active = 'active',
  inactive = 'inactive',
}

export enum DiscountTypeEnum {
  Percent,
  Dollar,
}

export enum RegistrationStatusEnum {
  draft = 'draft',
  registered = 'registered',
  confirmed = 'confirmed',
  attended = 'attended',
  cancelled = 'cancelled',
  pendingApproval = 'pendingApproval',
}

export enum RegistrationPaymentStatusEnum {
  pending = 'pending',
  invoiced = 'invoiced',
  paid = 'paid',
  refunded = 'refunded',
  confirmed = 'confirmed',
}

export enum InvitationStatusEnum {
  pending = 'pending',
  invited = 'invited',
  accepted = 'accepted',
  recalled = 'recalled',
  cancelled = 'cancelled',
}

export enum InvitationTypeEnum {
  manual = 'manual',
  auto = 'auto'
}