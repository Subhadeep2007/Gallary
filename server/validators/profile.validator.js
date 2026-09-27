import { body } from "express-validator";


// ========================================
// UPDATE PROFILE
// ========================================

const updateProfileSchema = [

    body("name")
    .trim()
    .notEmpty()
    .withMessage(
        "Name is required"
    )
    .isLength({
        min: 2,
        max: 50
    })
    .withMessage(
        "Name must be between 2 and 50 characters"
    )

];


// ========================================
// EXPORTS
// ========================================

export {

    updateProfileSchema

};