const { BrochureType, BrochureCategory, UniversityProgram, Brochure } = require('../models');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

class BrochureController {
    // Brochure Types
    static async getAllBrochureTypes(req, res) {
        try {
            const types = await BrochureType.find().sort({ name: 1 });

            // Add University Program counts
            const typesWithCounts = await Promise.all(types.map(async (type) => {
                const count = await UniversityProgram.countDocuments({ brochure_type_id: type._id });
                return {
                    ...type.toObject(),
                    upCount: count
                };
            }));

            return ResponseHandler.success(res, 'Brochure types retrieved successfully', typesWithCounts);
        } catch (error) {
            logger.error('Get brochure types error', { error: error.message });
            return ResponseHandler.serverError(res, 'Failed to get brochure types', error);
        }
    }

    static async createBrochureType(req, res) {
        try {
            const { name } = req.body;
            const type = await BrochureType.create({ name });
            return ResponseHandler.success(res, 'Brochure type created successfully', type);
        } catch (error) {
            logger.error('Create brochure type error', { error: error.message });
            return ResponseHandler.serverError(res, 'Failed to create brochure type', error);
        }
    }

    static async updateBrochureType(req, res) {
        try {
            const { id } = req.params;
            const type = await BrochureType.findByIdAndUpdate(id, req.body, { new: true });
            return ResponseHandler.success(res, 'Brochure type updated successfully', type);
        } catch (error) {
            logger.error('Update brochure type error', { error: error.message });
            return ResponseHandler.serverError(res, 'Failed to update brochure type', error);
        }
    }

    static async deleteBrochureType(req, res) {
        try {
            const { id } = req.params;

            // 1. Find all University Programs for this type
            const programs = await UniversityProgram.find({ brochure_type_id: id });

            for (const program of programs) {
                // 2. Find all brochures for each program to delete files
                const brochures = await Brochure.find({ university_program_id: program._id });

                for (const brochure of brochures) {
                    if (brochure.fileUrl) {
                        try {
                            const absolutePath = path.join(process.cwd(), 'uploads', brochure.fileUrl);
                            if (fs.existsSync(absolutePath)) {
                                fs.unlinkSync(absolutePath);

                                // Try to delete parent folders
                                const parentDir = path.dirname(absolutePath);
                                if (fs.readdirSync(parentDir).length === 0) {
                                    fs.rmdirSync(parentDir);
                                }

                                const grandParentDir = path.dirname(parentDir);
                                if (grandParentDir.includes(path.join('uploads', 'documents', 'brochure')) && fs.readdirSync(grandParentDir).length === 0) {
                                    fs.rmdirSync(grandParentDir);
                                }
                            }
                        } catch (fsError) {
                            logger.error('Error deleting brochure file during Type deletion', {
                                error: fsError.message,
                                fileUrl: brochure.fileUrl
                            });
                        }
                    }
                }

                // 3. Delete brochure records for the program
                await Brochure.deleteMany({ university_program_id: program._id });
            }

            // 4. Delete all University Program records for this type
            await UniversityProgram.deleteMany({ brochure_type_id: id });

            // 5. Delete the Brochure Type record itself
            await BrochureType.findByIdAndDelete(id);

            return ResponseHandler.success(res, 'Brochure type and all associated programs and brochures deleted successfully');
        } catch (error) {
            logger.error('Delete brochure type error', { error: error.message });
            return ResponseHandler.serverError(res, 'Failed to delete brochure type', error);
        }
    }

    // Brochure Categories
    static async getAllCategories(req, res) {
        try {
            const categories = await BrochureCategory.find().populate('brochure_type_id').sort({ name: 1 });
            return ResponseHandler.success(res, 'Categories retrieved successfully', categories);
        } catch (error) {
            logger.error('Get categories error', { error: error.message });
            return ResponseHandler.serverError(res, 'Failed to get categories', error);
        }
    }

    static async createCategory(req, res) {
        try {
            const category = await BrochureCategory.create(req.body);
            return ResponseHandler.success(res, 'Category created successfully', category);
        } catch (error) {
            logger.error('Create category error', { error: error.message });
            return ResponseHandler.serverError(res, 'Failed to create category', error);
        }
    }

    static async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const category = await BrochureCategory.findByIdAndUpdate(id, req.body, { new: true });
            return ResponseHandler.success(res, 'Category updated successfully', category);
        } catch (error) {
            logger.error('Update category error', { error: error.message });
            return ResponseHandler.serverError(res, 'Failed to update category', error);
        }
    }

    static async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            await BrochureCategory.findByIdAndDelete(id);
            return ResponseHandler.success(res, 'Category deleted successfully');
        } catch (error) {
            logger.error('Delete category error', { error: error.message });
            return ResponseHandler.serverError(res, 'Failed to delete category', error);
        }
    }

    static async getUPById(req, res) {
        try {
            const up = await UniversityProgram.findById(req.params.id || req.params.upId)
                .populate('brochure_type_id');
            if (!up) {
                return ResponseHandler.notFound(res, 'University program not found');
            }
            return ResponseHandler.success(res, 'University program retrieved successfully', up);
        } catch (error) {
            logger.error('Get up by id error', { error: error.message });
            return ResponseHandler.serverError(res, 'Failed to get university program', error);
        }
    }

    // University Programs (ups)
    static async getAllUniversityPrograms(req, res) {
        try {
            const ups = await UniversityProgram.find().populate('brochure_type_id').sort({ name: 1 });

            // Add brochure counts
            const upsWithCounts = await Promise.all(ups.map(async (up) => {
                const count = await Brochure.countDocuments({ university_program_id: up._id });
                return {
                    ...up.toObject(),
                    brochureCount: count
                };
            }));

            return ResponseHandler.success(res, 'University programs retrieved successfully', upsWithCounts);
        } catch (error) {
            logger.error('Get ups error', { error: error.message });
            return ResponseHandler.serverError(res, 'Failed to get university programs', error);
        }
    }

    static async getUniversityProgramsByType(req, res) {
        try {
            const { typeId } = req.params;
            const ups = await UniversityProgram.find({ brochure_type_id: typeId }).sort({ name: 1 });

            // Add brochure counts
            const upsWithCounts = await Promise.all(ups.map(async (up) => {
                const count = await Brochure.countDocuments({ university_program_id: up._id });
                return {
                    ...up.toObject(),
                    brochureCount: count
                };
            }));

            return ResponseHandler.success(res, 'University programs for type retrieved successfully', upsWithCounts);
        } catch (error) {
            logger.error('Get ups by type error', { error: error.message });
            return ResponseHandler.serverError(res, 'Failed to get university programs', error);
        }
    }

    static async createUniversityProgram(req, res) {
        try {
            const up = await UniversityProgram.create(req.body);
            return ResponseHandler.success(res, 'University program created successfully', up);
        } catch (error) {
            logger.error('Create up error', { error: error.message });
            return ResponseHandler.serverError(res, 'Failed to create university program', error);
        }
    }

    static async updateUniversityProgram(req, res) {
        try {
            const { id } = req.params;
            const up = await UniversityProgram.findByIdAndUpdate(id, req.body, { new: true });
            return ResponseHandler.success(res, 'University program updated successfully', up);
        } catch (error) {
            logger.error('Update up error', { error: error.message });
            return ResponseHandler.serverError(res, 'Failed to update university program', error);
        }
    }

    static async deleteUniversityProgram(req, res) {
        try {
            const { id } = req.params;

            // Find all brochures for this UP to delete their files
            const brochures = await Brochure.find({ university_program_id: id });

            for (const brochure of brochures) {
                // Physically delete the file if it exists
                if (brochure.fileUrl) {
                    try {
                        const absolutePath = path.join(process.cwd(), 'uploads', brochure.fileUrl);
                        if (fs.existsSync(absolutePath)) {
                            fs.unlinkSync(absolutePath);

                            // Try to delete parent folders if empty
                            const parentDir = path.dirname(absolutePath);
                            if (fs.readdirSync(parentDir).length === 0) {
                                fs.rmdirSync(parentDir);
                            }

                            const grandParentDir = path.dirname(parentDir);
                            if (grandParentDir.includes(path.join('uploads', 'documents', 'brochure')) && fs.readdirSync(grandParentDir).length === 0) {
                                fs.rmdirSync(grandParentDir);
                            }
                        }
                    } catch (fsError) {
                        logger.error('Error deleting brochure file during UP deletion', {
                            error: fsError.message,
                            fileUrl: brochure.fileUrl
                        });
                    }
                }
            }

            // Delete brochure records
            await Brochure.deleteMany({ university_program_id: id });

            // Delete program record
            await UniversityProgram.findByIdAndDelete(id);

            return ResponseHandler.success(res, 'University program and all associated brochures deleted successfully');
        } catch (error) {
            logger.error('Delete up error', { error: error.message });
            return ResponseHandler.serverError(res, 'Failed to delete university program', error);
        }
    }

    // Brochures
    static async getBrochuresByUP(req, res) {
        try {
            const { upId } = req.params;
            const brochures = await Brochure.find({ university_program_id: upId }).populate('brochure_category_id');
            return ResponseHandler.success(res, 'Brochures retrieved successfully', brochures);
        } catch (error) {
            logger.error('Get brochures error', { error: error.message });
            return ResponseHandler.serverError(res, 'Failed to get brochures', error);
        }
    }

    static async getDynamicStoragePath(categoryId, originalFilename) {
        const category = await BrochureCategory.findById(categoryId).populate('brochure_type_id');
        if (!category) return null;

        const typeName = category.brochure_type_id?.name || 'Standard';
        const categoryName = category.name;
        const dateStr = moment().format('DD-MM-YYYY');

        // Sanitize names for folder paths
        const sanitize = (str) => str.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const mainFolderName = `${sanitize(typeName)}_${sanitize(categoryName)}_${dateStr}`;

        // Simplified path: documents/brochure/{type}_{name}_{date}
        const relativePath = path.join('documents', 'brochure', mainFolderName);
        const absolutePath = path.join(process.cwd(), 'uploads', relativePath);

        if (!fs.existsSync(absolutePath)) {
            fs.mkdirSync(absolutePath, { recursive: true });
        }

        return {
            relativePath: `/${relativePath.replace(/\\/g, '/')}`,
            absolutePath
        };
    }

    static async createBrochure(req, res) {
        try {
            const { upId } = req.params;
            const brochureData = {
                ...req.body,
                university_program_id: upId,
                // Ensure brochure_category_id is set from category_id if needed
                brochure_category_id: req.body.brochure_category_id || req.body.category_id
            };

            console.log('Create Brochure Request:', {
                params: req.params,
                body: req.body,
                file: req.file ? {
                    filename: req.file.filename,
                    originalname: req.file.originalname,
                    path: req.file.path
                } : 'No file'
            });

            // If a file was uploaded, add the URL
            if (req.file) {
                const storageInfo = await BrochureController.getDynamicStoragePath(
                    brochureData.brochure_category_id,
                    req.file.originalname
                );

                if (storageInfo) {
                    const finalPath = path.join(storageInfo.absolutePath, req.file.originalname);
                    fs.renameSync(req.file.path, finalPath);

                    const fileUrl = `${storageInfo.relativePath}/${req.file.originalname}`;
                    brochureData.fileUrl = fileUrl;
                    if (!brochureData.url) {
                        brochureData.url = fileUrl;
                    }
                } else {
                    // Fallback to temp if category not found (shouldn't happen with validation)
                    const fileUrl = `/uploads/temp/${req.file.filename}`;
                    brochureData.fileUrl = fileUrl;
                    if (!brochureData.url) {
                        brochureData.url = fileUrl;
                    }
                }

                if (!brochureData.name) {
                    brochureData.name = req.file.originalname;
                }
            }

            // Remove empty fields to avoid validation issues
            if (!brochureData.date) delete brochureData.date;

            console.log('Final Brochure Data to Save:', brochureData);

            const brochure = await Brochure.create(brochureData);

            // Populating category for the response
            const populatedBrochure = await Brochure.findById(brochure._id).populate('brochure_category_id');

            return ResponseHandler.success(res, 'Brochure created successfully', populatedBrochure);
        } catch (error) {
            console.error('Detailed Create Brochure Error:', error);
            logger.error('Create brochure error', { error: error.message, stack: error.stack });
            return ResponseHandler.serverError(res, `Failed to create brochure: ${error.message}`, error);
        }
    }
    static async updateBrochure(req, res) {
        try {
            const { id } = req.params;
            const updateData = { ...req.body };

            // Fix field mapping
            if (req.body.category_id) {
                updateData.brochure_category_id = req.body.category_id;
            }

            if (req.file) {
                const categoryId = updateData.brochure_category_id || (await Brochure.findById(id)).brochure_category_id;
                const storageInfo = await BrochureController.getDynamicStoragePath(
                    categoryId,
                    req.file.originalname
                );

                if (storageInfo) {
                    const finalPath = path.join(storageInfo.absolutePath, req.file.originalname);
                    fs.renameSync(req.file.path, finalPath);

                    const fileUrl = `${storageInfo.relativePath}/${req.file.originalname}`;
                    updateData.fileUrl = fileUrl;
                    if (!updateData.url) {
                        updateData.url = fileUrl;
                    }
                } else {
                    const fileUrl = `/uploads/temp/${req.file.filename}`;
                    updateData.fileUrl = fileUrl;
                    if (!updateData.url) {
                        updateData.url = fileUrl;
                    }
                }

                if (!updateData.name) {
                    updateData.name = req.file.originalname;
                }
            }

            const brochure = await Brochure.findByIdAndUpdate(id, updateData, { new: true }).populate('brochure_category_id');
            if (!brochure) {
                return ResponseHandler.notFound(res, 'Brochure not found');
            }

            return ResponseHandler.success(res, 'Brochure updated successfully', brochure);
        } catch (error) {
            logger.error('Update brochure error', { error: error.message });
            return ResponseHandler.serverError(res, 'Failed to update brochure', error);
        }
    }


    static async deleteBrochure(req, res) {
        try {
            const { id } = req.params;
            const brochure = await Brochure.findById(id);

            if (!brochure) {
                return ResponseHandler.notFound(res, 'Brochure not found');
            }

            // Physically delete the file if it exists
            if (brochure.fileUrl) {
                try {
                    const absolutePath = path.join(process.cwd(), 'uploads', brochure.fileUrl);
                    if (fs.existsSync(absolutePath)) {
                        fs.unlinkSync(absolutePath);

                        // Also try to delete the parent folder (it might be the nested {filename} folder)
                        const parentDir = path.dirname(absolutePath);
                        if (fs.readdirSync(parentDir).length === 0) {
                            fs.rmdirSync(parentDir);
                        }

                        // And potentially the {type}_{name}_{date} folder if that's also empty
                        const grandParentDir = path.dirname(parentDir);
                        // Check if grandparent is still inside uploads/documents/brochure
                        if (grandParentDir.includes(path.join('uploads', 'documents', 'brochure')) && fs.readdirSync(grandParentDir).length === 0) {
                            fs.rmdirSync(grandParentDir);
                        }
                    }
                } catch (fsError) {
                    logger.error('Error deleting brochure file', {
                        error: fsError.message,
                        fileUrl: brochure.fileUrl
                    });
                }
            }

            await Brochure.findByIdAndDelete(id);
            return ResponseHandler.success(res, 'Brochure deleted successfully');
        } catch (error) {
            logger.error('Delete brochure error', { error: error.message });
            return ResponseHandler.serverError(res, 'Failed to delete brochure', error);
        }
    }
}

module.exports = BrochureController;
