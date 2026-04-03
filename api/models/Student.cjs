const mongoose = require("mongoose");

const subjectSchema = {
  assignment: { type: Number, default: 0 },
  descriptive: { type: Number, default: 0 },
  tot: { type: Number, default: 0 },
};

const studentSchema = new mongoose.Schema(
  {
    slNo: { type: Number, required: true },
    htno: { type: String, required: true, unique: true, uppercase: true, trim: true },
    computerOrientedStatisticalMethods: subjectSchema,
    businessEconomicsAndFinancialAnalysis: subjectSchema,
    dataAnalyticsUsingR: subjectSchema,
    objectOrientedProgrammingThroughJava: subjectSchema,
    designAndAnalysisOfAlgorithms: subjectSchema,
    dataAnalyticsUsingRLab: subjectSchema,
    objectOrientedProgrammingThroughJavaLab: subjectSchema,
    realTimeResearchProject: subjectSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.models.Student || mongoose.model("Student", studentSchema);
