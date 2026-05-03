const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter project name'],
  },
  description: {
    type: String,
  },
  location: {
    type: String,
    required: [true, 'Please enter project location'],
  },
  capacity: {
    type: Number,
    required: [true, 'Please enter project capacity (MW)'],
  },
  terrainData: {
    elevation: [[Number]],
    slope: [[Number]],
    solarRadiation: [[Number]],
  },
  panelLayout: {
    type: Array,
  },
  equipmentLayout: {
    type: Array,
  },
  cableRouting: {
    type: Array,
  },
  costAnalysis: {
    equipment: Number,
    cables: Number,
    construction: Number,
    other: Number,
  },
  performanceData: {
    annualGeneration: Number,
    efficiency: Number,
    roi: Number,
  },
  status: {
    type: String,
    enum: ['planning', 'construction', 'operational', 'completed'],
    default: 'planning',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

// 更新updatedAt字段
projectSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;