const { BeanModel } = require("redbean-node/dist/bean-model");
const { R } = require("redbean-node");
const dayjs = require("dayjs");

class Incident extends BeanModel {
    /**
     * Resolve the incident and mark it as inactive
     * @returns {Promise<void>}
     */
    async resolve() {
        this.active = false;
        this.pin = false;
        this.last_updated_date = R.isoDateTime(dayjs.utc());
        await R.store(this);
    }

    /**
     * Get all updates for this incident, ordered by created_date ascending
     * @returns {Promise<Bean[]>} List of incident_update beans
     */
    async getUpdates() {
        return await R.find("incident_update", " incident_id = ? ORDER BY created_date ASC", [this.id]);
    }

    /**
     * Return an object that ready to parse to JSON for public
     * @param {boolean} includeUpdates Whether to include the updates array
     * @returns {object|Promise<object>} Object ready to parse
     */
    toPublicJSON(includeUpdates = false) {
        const json = {
            id: this.id,
            style: this.style,
            title: this.title,
            content: this.content,
            pin: !!this.pin,
            active: !!this.active,
            createdDate: this.created_date,
            lastUpdatedDate: this.last_updated_date,
            status_page_id: this.status_page_id,
        };

        if (includeUpdates && this.updateList) {
            json.updates = this.updateList.map((u) => u.toPublicJSON());
        }

        return json;
    }

    /**
     * Load updates and return public JSON with updates included
     * @returns {Promise<object>} Object ready to parse with updates
     */
    async toPublicJSONWithUpdates() {
        this.updateList = await this.getUpdates();
        return this.toPublicJSON(true);
    }
}

module.exports = Incident;
