import mongoose, {Schema} from "mongoose"
import { IKeyBinding, KeyBindingData } from "../@types/keybinding"
import { KEYBINDING_CATEGORIES } from "../constants/keybinding_categories"

//subscheam for keybinding insers
const keyBindingDataSchema = new Schema<KeyBindingData>({
    id: {
        type: String,
        required: true
    },
    value: {
        type: [String],
        required: true,
        default: []
    }
}, {_id: false}) //disable id for the subdocuments

const keyBindingSchema = new Schema<IKeyBinding>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Must assign the binding to some user"]
    },
    name: {
        type: String,
        required: true,
        minlength: [3, "Name must be at least 3 characters long"],
        maxlength: [50, "Max key binding save name is 50 chars"]
    },
    description: {
        type: String,
        required: false,
        default: null,
        maxlength: [3000, "Description cannot exceed 2000 characters"]
    },
    keyBinding: {
        type: [keyBindingDataSchema],
        required: true
    },
    public: {
        type: Boolean,
        required: true,
        default: false
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    useNumber: {
        type: Number,
        required: [true, "The number of keybiding use must be initialized"],
        default: 0
    },
    category: {
        type: String,
        enum: {
            values: KEYBINDING_CATEGORIES,
            message: "Category is not valid"
        },
        default: 'general',
        required: true
    }
})

// enforce uniqueness on user and save name combiantion
keyBindingSchema.index({userId: 1, name: 1}, {unique: true})

keyBindingDataSchema.index({userId: 1})

const KeyBinding = mongoose.model("keyBinding", keyBindingSchema)

export default KeyBinding