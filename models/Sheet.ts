import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  rollNumber: { type: String, required: true },
  name: { type: String, required: true },
  marks: { type: Map, of: Number, default: new Map() },
  totalMarks: { type: Number, default: 0 }
});

const SheetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherName: { type: String, required: true },
  questions: [{ type: String, required: true }],
  clos: [{ type: String, required: true }],
  plos: [{ type: String, required: true }],
  students: [StudentSchema],
  // Total possible marks for the entire assessment
  totalPossibleMarks: { type: Number, default: 0, min: 0 },
  // Approval workflow fields
  status: { 
    type: String, 
    enum: ['draft', 'pending_approval', 'approved', 'rejected'], 
    default: 'draft' 
  },
  submittedAt: { type: Date },
  approvedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedByName: { type: String },
  rejectionReason: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Calculate total marks for each student before saving
SheetSchema.pre('save', function(next) {
  this.students.forEach(student => {
    let total = 0;
    if (student.marks && student.marks instanceof Map) {
      student.marks.forEach((mark: number) => {
        if (typeof mark === 'number' && !isNaN(mark)) {
          total += mark;
        }
      });
    }
    student.totalMarks = total;
  });
  this.updatedAt = new Date();
  next();
});

// Add a method to convert Map to plain object for JSON serialization
SheetSchema.methods.toJSON = function() {
  const obj = this.toObject();
  if (obj.students) {
    obj.students = obj.students.map((student: any) => ({
      ...student,
      marks: Object.fromEntries(student.marks || new Map())
    }));
  }
  return obj;
};

export default mongoose.models.Sheet || mongoose.model('Sheet', SheetSchema);
