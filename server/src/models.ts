import mongoose, { Schema, InferSchemaType } from 'mongoose';

const organizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    reraRegistration: { type: String, default: 'N/A' },
    subscriptionPlan: { type: String, default: 'Standard Free' },
    planId: { type: String, default: 'plan-free' },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    planExpiresAt: { type: Date, default: null },

    // Directory listing
    category: { type: String, default: 'Consultants' },
    businessType: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    // Platform-operator organizations are not businesses and stay out of the directory.
    listed: { type: Boolean, default: true },
    // Set by platform staff after a report; a suspended company cannot send anything to others.
    suspended: { type: Boolean, default: false },
    // Set by platform staff once statutory documents are checked; never by the company itself.
    verified: { type: Boolean, default: false },
    // Owner-editable public profile; fields are validated in routes/companies.ts.
    profile: { type: Schema.Types.Mixed, default: {} },
    reviews: [
      {
        authorOrgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
        authorName: { type: String, required: true },
        authorCompany: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, minimize: false }
);

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: '' },
    roles: { type: [String], required: true },
    // What the person may do inside their company: OWNER > ADMIN > MEMBER > VIEWER.
    orgRole: { type: String, enum: ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'], default: 'OWNER' },
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    status: { type: String, enum: ['ACTIVE', 'LOCKED', 'INACTIVE', 'PENDING_VERIFICATION'], default: 'ACTIVE' },
    failedAttempts: { type: Number, default: 0 },
    firstFailedAt: { type: Date, default: null },
    lockoutUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const roleSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    permissions: { type: [String], default: [] },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const refreshTokenSchema = new Schema({
  tokenHash: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  activeRole: { type: String, required: true },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  sessionStart: { type: Date, default: Date.now },
  lastUsedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
});

const contactRequestSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    message: { type: String, required: true },
    handled: { type: Boolean, default: false, index: true },
    handledBy: { type: String, default: '' },
  },
  { timestamps: true }
);

const reportSchema = new Schema(
  {
    reporterOrgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    reportedOrgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    reportedBy: { type: String, required: true },
    reason: { type: String, required: true },
    details: { type: String, default: '' },
    status: { type: String, enum: ['open', 'dismissed', 'actioned'], default: 'open', index: true },
    reviewedBy: { type: String, default: '' },
    reviewedAt: { type: Date, default: null },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

const blockSchema = new Schema({
  orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  blockedOrgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
});
blockSchema.index({ orgId: 1, blockedOrgId: 1 }, { unique: true });

const verificationSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, unique: true },
    status: { type: String, enum: ['draft', 'submitted', 'approved', 'rejected'], default: 'draft' },
    gstin: { type: String, default: '' },
    pan: { type: String, default: '' },
    cin: { type: String, default: '' },
    reraNumber: { type: String, default: '' },
    documents: [{ fileId: { type: String, required: true }, label: { type: String, required: true }, _id: false }],
    submittedAt: { type: Date, default: null },
    reviewedBy: { type: String, default: '' },
    reviewedAt: { type: Date, default: null },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

const paymentSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    invoiceNo: { type: String, required: true, unique: true },
    planId: { type: String, required: true },
    cycle: { type: String, enum: ['monthly', 'yearly'], required: true },
    amount: { type: Number, required: true },
    gst: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'cancelled'], default: 'pending' },
    method: { type: String, default: '' },
    reference: { type: String, default: '' },
    razorpayOrderId: { type: String, default: '' },
    requestedBy: { type: String, required: true },
    confirmedBy: { type: String, default: '' },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const inviteSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, default: '' },
    orgRole: { type: String, enum: ['ADMIN', 'MEMBER', 'VIEWER'], required: true },
    stakeholderRole: { type: String, required: true },
    codeHash: { type: String, required: true, unique: true },
    invitedBy: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

const auditLogSchema = new Schema({
  seq: { type: Number, required: true, unique: true },
  timestamp: { type: Date, required: true },
  userId: { type: String, required: true },
  userRole: { type: String, required: true },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: String, required: true },
  status: { type: String, enum: ['SUCCESS', 'FAILURE', 'WARNING'], required: true },
  details: { type: String, required: true },
  ipAddress: { type: String, required: true },
  prevHash: { type: String, required: true },
  chainHash: { type: String, required: true },
});

// Rule LOG-01: audit records are append-only. Block every mutating query at the model layer.
const rejectMutation = function () {
  throw new Error('Audit log records are immutable (Rule LOG-01).');
};
for (const op of ['updateOne', 'updateMany', 'findOneAndUpdate', 'replaceOne', 'findOneAndReplace', 'deleteOne', 'deleteMany', 'findOneAndDelete'] as const) {
  auditLogSchema.pre(op, rejectMutation);
}

const systemConfigSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['boolean', 'string', 'number'], required: true },
    category: { type: String, enum: ['Security', 'Storage', 'Logging', 'System'], required: true },
  },
  { timestamps: true }
);

const masterCategorySchema = new Schema({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  order: { type: Number, default: 0 },
});

const masterSchema = new Schema(
  {
    category: { type: String, required: true },
    code: { type: String, required: true },
    name: { type: String, required: true },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);
masterSchema.index({ category: 1, code: 1 }, { unique: true });

const notificationSchema = new Schema(
  {
    type: { type: String, enum: ['email', 'sms', 'push', 'in_app'], required: true },
    recipient: { type: String, required: true },
    content: { type: String, required: true },
    status: { type: String, enum: ['sent', 'failed', 'queued'], default: 'queued' },
    createdBy: { type: String, required: true },
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  },
  { timestamps: true }
);

const uploadedFileSchema = new Schema(
  {
    name: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    mimeType: { type: String, required: true },
    status: { type: String, enum: ['scanning', 'success', 'failed'], default: 'scanning' },
    storagePath: { type: String, required: true },
    md5: { type: String, required: true },
    uploaderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploaderEmail: { type: String, required: true },
    // 'network': any signed-in user can open it (e.g. an RFQ attachment). Otherwise only the owner and companies it was shared with.
    visibility: { type: String, enum: ['private', 'network'], default: 'private' },
    sharedWith: { type: [Schema.Types.ObjectId], default: [] },
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  },
  { timestamps: true }
);

/**
 * One row per (workspace key, owner). For `list` keys the row only marks the
 * dataset as initialised - the items live in their own collection. For `value`
 * keys the row holds the JSON value itself.
 */
const storeEntrySchema = new Schema(
  {
    key: { type: String, required: true },
    owner: { type: String, required: true },
    kind: { type: String, enum: ['list', 'value'], required: true },
    value: { type: Schema.Types.Mixed, default: null },
    updatedBy: { type: String, default: '' },
  },
  { timestamps: true, minimize: false }
);
storeEntrySchema.index({ key: 1, owner: 1 }, { unique: true });

export const Organization = mongoose.model('Organization', organizationSchema);
export const User = mongoose.model('User', userSchema);
export const Role = mongoose.model('Role', roleSchema);
export const ContactRequest = mongoose.model('ContactRequest', contactRequestSchema);
export const Report = mongoose.model('Report', reportSchema);
export const Block = mongoose.model('Block', blockSchema);
export const Verification = mongoose.model('Verification', verificationSchema);
export const Payment = mongoose.model('Payment', paymentSchema);
export const Invite = mongoose.model('Invite', inviteSchema);
export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);
export const MasterCategory = mongoose.model('MasterCategory', masterCategorySchema);
export const Master = mongoose.model('Master', masterSchema);
export const Notification = mongoose.model('Notification', notificationSchema);
export const UploadedFile = mongoose.model('UploadedFile', uploadedFileSchema);
export const StoreEntry = mongoose.model('StoreEntry', storeEntrySchema);

export type UserDoc = mongoose.HydratedDocument<InferSchemaType<typeof userSchema>>;
