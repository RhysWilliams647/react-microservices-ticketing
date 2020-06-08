import mongoose from 'mongoose';
import { Password } from '../services/password';

//  An interface that describes the properties
//  that are required by a new user (how to create a user)
interface UserAttrs {
  email: string;
  password: string;
}

//  An interface that describes the properties
//  the user model has (functions which exist on the user model)
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

//  An interface that describes the properties that a User Document has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

//  Use a normal function so that 'this' is set to the user document
//  being saved, else it would be the context of this file
userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
