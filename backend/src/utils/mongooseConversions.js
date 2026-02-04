/**
 * MongoDB/Mongoose Query Conversion Helper
 * Use this to quickly find and replace Sequelize patterns
 */

const conversions = {
    // Sequelize -> Mongoose
    findAll: 'find',
    findByPk: 'findById',
    findOne: 'findOne', // Same but remove {where: }
    findAndCountAll: 'use find() and countDocuments()',
    create: 'create',
    destroy: 'deleteOne/deleteMany',
    update: 'updateOne/updateMany OR model.save()',

    // Query patterns
    where_clause: 'MongoDB query object (no where: wrapper)',
    Op_like: '$regex with $options: "i"',
    Op_or: '$or',
    Op_and: '$',
    Op_in: '$in',
    Op_between: '$gte and $lte',

    // Pagination
    limit_offset: 'limit() and skip()',
    order: 'sort({ field: 1 or -1 })',

    // Attributes
    attributes_exclude: 'select("-field")',
    attributes_include: 'select("field1 field2")',

    // Include/Associations
    include: 'populate("ref", "fields")',

    // Transactions
    transaction: 'session (const session = await mongoose.startSession())',

    // Field access
    'model.id': 'model._id',
    'model.update()': 'model.field = value; await model.save()',
};

module.exports = conversions;
