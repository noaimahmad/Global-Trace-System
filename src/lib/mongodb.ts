import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn('MONGODB_URI is not defined in environment variables. Falling back to local MongoDB if available.');
}

export let isConnected = false;

export const connectDB = async () => {
  if (!MONGODB_URI) {
    console.error('CRITICAL: MONGODB_URI is not defined. The application will not be able to connect to the database.');
    return;
  }
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    isConnected = true;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${(error as Error).message}`);
    isConnected = false;
  }
};

// User Schema
interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password_hash: string;
  role: string;
  email_verified: boolean;
  two_factor_enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, default: 'user' },
  email_verified: { type: Boolean, default: false },
  two_factor_enabled: { type: Boolean, default: false },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

// Session Schema
interface ISession extends mongoose.Document {
  user_id: mongoose.Types.ObjectId;
  ip_address: string;
  approx_country: string;
  approx_region: string;
  browser: string;
  os: string;
  device_type: string;
  revoked_at: Date;
  createdAt: Date;
}

const sessionSchema = new mongoose.Schema<ISession>({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ip_address: String,
  approx_country: String,
  approx_region: String,
  browser: String,
  os: String,
  device_type: String,
  revoked_at: Date,
}, { timestamps: { createdAt: true, updatedAt: false } });

export const Session = mongoose.models.Session || mongoose.model<ISession>('Session', sessionSchema);

// Phone Check Schema
interface IPhoneCheck extends mongoose.Document {
  user_id: mongoose.Types.ObjectId;
  raw_input: string;
  normalized_number: string;
  country_code: string;
  country_name: string;
  validity: boolean;
  carrier_name: string;
  line_type: string;
  consent_confirmed: boolean;
  checked_at: Date;
}

const phoneCheckSchema = new mongoose.Schema<IPhoneCheck>({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  raw_input: String,
  normalized_number: String,
  country_code: String,
  country_name: String,
  validity: Boolean,
  carrier_name: String,
  line_type: String,
  consent_confirmed: Boolean,
}, { timestamps: { createdAt: 'checked_at', updatedAt: false } });

export const PhoneCheck = mongoose.models.PhoneCheck || mongoose.model<IPhoneCheck>('PhoneCheck', phoneCheckSchema);

// IP Check Schema
interface IIpCheck extends mongoose.Document {
  user_id: mongoose.Types.ObjectId;
  ip_address: string;
  city: string;
  region: string;
  country: string;
  timezone: string;
  isp: string;
  asn: string;
  vpn_detected: boolean;
  proxy_detected: boolean;
  tor_detected: boolean;
  checked_at: Date;
}

const ipCheckSchema = new mongoose.Schema<IIpCheck>({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ip_address: String,
  city: String,
  region: String,
  country: String,
  timezone: String,
  isp: String,
  asn: String,
  vpn_detected: Boolean,
  proxy_detected: Boolean,
  tor_detected: Boolean,
}, { timestamps: { createdAt: 'checked_at', updatedAt: false } });

export const IpCheck = mongoose.models.IpCheck || mongoose.model<IIpCheck>('IpCheck', ipCheckSchema);

// Indicator Check Schema
interface IIndicatorCheck extends mongoose.Document {
  user_id: mongoose.Types.ObjectId;
  indicator_type: string;
  indicator_value: string;
  reputation_score: number;
  summary: string;
  source_count: number;
  checked_at: Date;
}

const indicatorCheckSchema = new mongoose.Schema<IIndicatorCheck>({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  indicator_type: String,
  indicator_value: String,
  reputation_score: Number,
  summary: String,
  source_count: Number,
}, { timestamps: { createdAt: 'checked_at', updatedAt: false } });

export const IndicatorCheck = mongoose.models.IndicatorCheck || mongoose.model<IIndicatorCheck>('IndicatorCheck', indicatorCheckSchema);

// Fraud Report Schema
interface IFraudReport extends mongoose.Document {
  user_id: mongoose.Types.ObjectId;
  category: string;
  indicator_value: string;
  description: string;
  status: string;
  reviewed_by: mongoose.Types.ObjectId;
  reviewed_at: Date;
  createdAt: Date;
  updatedAt: Date;
}

const fraudReportSchema = new mongoose.Schema<IFraudReport>({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: String,
  indicator_value: String,
  description: String,
  status: { type: String, default: 'pending' },
  reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewed_at: Date,
}, { timestamps: true });

export const FraudReport = mongoose.models.FraudReport || mongoose.model<IFraudReport>('FraudReport', fraudReportSchema);

// Blocked Indicator Schema
interface IBlockedIndicator extends mongoose.Document {
  indicator_type: string;
  indicator_value: string;
  reason: string;
  createdAt: Date;
  updatedAt: Date;
}

const blockedIndicatorSchema = new mongoose.Schema<IBlockedIndicator>({
  indicator_type: String,
  indicator_value: String,
  reason: String,
}, { timestamps: true });

export const BlockedIndicator = mongoose.models.BlockedIndicator || mongoose.model<IBlockedIndicator>('BlockedIndicator', blockedIndicatorSchema);
