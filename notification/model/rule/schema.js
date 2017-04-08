const mongoose = require('mongoose')
const Schema = mongoose.Schema
const shortId = require('shortid')
const timestamps = require('mongoose-timestamp')

const rSchema = new Schema({
  _id: {
    type: String,
    unique: true,
    default: shortId.generate
  },
  name: { type: String, required: true },
  product: {
    type: String,
    ref: 'Product',
    required: true
  },
  label: [{ type: String, required: true }],
  level: {
    type: Number,
    default: 0
  }, // 消息类型 0-普通消息 1-特别消息 2-紧急消息
  condition: { type: String, required: true },
  template: { type: String, required: true }
})
rSchema.plugin(timestamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})

module.exports = mongoose.model('Rule', rSchema)
