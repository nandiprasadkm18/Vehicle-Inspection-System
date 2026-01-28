const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Connect immediately (but async)
connectDB().then(() => console.log('Connected to MongoDB')).catch(err => console.error(err));

// Schemas
const InspectionSchema = new mongoose.Schema({
  inspector_name: String,
  vehicle_id: String,
  start_time: String,
  status: { type: String, default: 'IN_PROGRESS' },
  final_hash: String,
  inspector_selfie_url: String, // Path to selfie
  inspector_badge_id: String,   // Inspector ID Number
  inspector_id_card_url: String,// Path to ID Card Photo
  inspector_rc_url: String,     // Path to RC Photo
  engine_number: String,
  model_number: String,
  chassis_number: String,
  password: String              // Simple password (as requested)
});

// To ensure frontend compatibility, map _id to id in toJSON
InspectionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

const StepSchema = new mongoose.Schema({
  inspection_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Inspection' },
  step_name: String,
  result: String, // PASS, FAIL
  note: String,
  timestamp: String,
  latitude: Number,
  longitude: Number,
  photo_url: String, // Path to evidence photo
  previous_hash: String,
  current_hash: String
});

StepSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

const Inspection = mongoose.model('Inspection', InspectionSchema);
const Step = mongoose.model('Step', StepSchema);

module.exports = {
  Inspection,
  Step
};
