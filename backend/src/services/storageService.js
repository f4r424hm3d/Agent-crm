const fs = require('fs');
const path = require('path');

const UPLOADS_BASE = 'uploads/documents/agents';

/**
 * Sanitize string for filename/foldername
 */
const sanitize = (str) => {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
};

/**
 * Move uploaded file to structured agent folder
 * @param {Object} file - Multer file object
 * @param {Object} agent - Agent mongoose document
 * @param {String} documentKey - Document key (e.g. 'idProof', 'resume') - optional, used for filename if original name is generic? 
 *                               Actually user said "document_key_or_filename". We'll try to preserve extension.
 * @returns {String} relativePath - Path to store in DB
 */
const moveFileToAgentFolder = (file, agent, documentKey) => {
    // 1. Prepare folder name components
    const agentName = sanitize(agent.firstName + ' ' + agent.lastName);
    const agentId = agent._id.toString();
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // 2. Construct folder path
    const folderName = `${agentName}_${agentId}_${date}`;
    const targetDir = path.join(process.cwd(), UPLOADS_BASE, folderName);

    // 3. Create directory
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    // 4. Construct filename
    // Requirement: "document_key_or_filename"
    // If we have documentKey (e.g. 'idProof'), let's use it to be clean: id_proof.pdf
    // If not, use original name.
    const ext = path.extname(file.originalname);
    let finalFilename = file.originalname;

    if (documentKey) {
        finalFilename = `${sanitize(documentKey)}${ext}`;
    } else {
        finalFilename = sanitize(path.parse(file.originalname).name) + ext;
    }

    const targetPath = path.join(targetDir, finalFilename);

    // 5. Move file
    // Handle cases where source might be different partition (copy+unlink)
    try {
        fs.renameSync(file.path, targetPath);
    } catch (err) {
        // Fallback for cross-device link
        fs.copyFileSync(file.path, targetPath);
        fs.unlinkSync(file.path);
    }

    // 6. Return relative path for DB
    // e.g. uploads/documents/agents/ritik_saini_123_2026-02-13/id_proof.pdf
    return path.join(UPLOADS_BASE, folderName, finalFilename);
};

module.exports = {
    moveFileToAgentFolder
};
