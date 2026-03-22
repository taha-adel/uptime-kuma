const { BeanModel } = require("redbean-node/dist/bean-model");

class IncidentUpdate extends BeanModel {
    /**
     * Valid status values for incident updates
     * @type {string[]}
     */
    static VALID_STATUSES = ["investigating", "identified", "monitoring", "resolved", "update"];

    /**
     * Return an object that ready to parse to JSON for public
     * @returns {object} Object ready to parse
     */
    toPublicJSON() {
        return {
            id: this.id,
            incidentId: this.incident_id,
            status: this.status,
            message: this.message,
            createdDate: this.created_date,
        };
    }

    /**
     * Validate the status value
     * @param {string} status Status to validate
     * @returns {boolean} Whether the status is valid
     */
    static isValidStatus(status) {
        return IncidentUpdate.VALID_STATUSES.includes(status);
    }
}

module.exports = IncidentUpdate;
