const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let PostSchema = new Schema({
  id: { type: String, required: true, index: true, unique: true },
  title: { type: String, required: true, minlength: 1, maxlength: 100 },
  post: { type: String, required: true, minlength: 1, maxlength: 200 },
  author: { type: String, required: true },
  date: { type: Date, default: Date.now() },
  comments: [[{ 
    id: { type: String, required: true }, 
    postId: { type: String, required: true }, 
    author: { type: String, required: true },
    date: { type: Date, default: Date.now() },
    comment: { type: String, required: true, minlength: 1, maxlength: 200 },
    threadId: { type: Number, required: true }, 
  }]]
});

module.exports = {
  post: PostSchema,
};
