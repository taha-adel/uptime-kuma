<template>
    <div class="incident-update-form" data-testid="incident-update-form">
        <div class="card border-0 shadow-sm">
            <div class="card-body p-3">
                <h6 class="card-title mb-2">
                    <font-awesome-icon icon="comment-alt" class="me-1" />
                    {{ $t("Post Update") }}
                </h6>

                <div class="mb-2">
                    <label for="update-status" class="form-label small mb-1">{{ $t("Update Status") }}</label>
                    <select
                        id="update-status"
                        v-model="form.status"
                        class="form-select form-select-sm"
                        data-testid="update-status-select"
                    >
                        <option v-if="availableStatuses.includes('investigating')" value="investigating">
                            {{ $t("Investigating") }}
                        </option>
                        <option v-if="availableStatuses.includes('identified')" value="identified">
                            {{ $t("Identified") }}
                        </option>
                        <option v-if="availableStatuses.includes('monitoring')" value="monitoring">
                            {{ $t("Monitoring") }}
                        </option>
                        <option v-if="availableStatuses.includes('resolved')" value="resolved">
                            {{ $t("Resolved") }}
                        </option>
                        <option v-if="availableStatuses.includes('update')" value="update">{{ $t("Update") }}</option>
                    </select>
                </div>

                <div class="mb-2">
                    <label for="update-message" class="form-label small mb-1">{{ $t("Update Message") }}</label>
                    <textarea
                        id="update-message"
                        v-model="form.message"
                        class="form-control form-control-sm"
                        rows="2"
                        :placeholder="$t('Add an update to this incident')"
                        data-testid="update-message-input"
                    ></textarea>
                    <div class="form-text small">{{ $t("markdownSupported") }}</div>
                </div>

                <div class="d-flex justify-content-end">
                    <button
                        class="btn btn-primary btn-sm"
                        :disabled="processing || !form.message.trim()"
                        data-testid="post-update-button"
                        @click="postUpdate"
                    >
                        <span v-if="processing" class="spinner-border spinner-border-sm me-1" role="status"></span>
                        <font-awesome-icon v-else icon="paper-plane" class="me-1" />
                        {{ $t("Post Update") }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "IncidentUpdateForm",
    props: {
        slug: {
            type: String,
            required: true,
        },
        incidentId: {
            type: Number,
            required: true,
        },
        updates: {
            type: Array,
            default: () => [],
        },
    },
    emits: ["update-posted"],
    data() {
        return {
            processing: false,
            form: {
                status: "investigating",
                message: "",
            },
        };
    },
    computed: {
        availableStatuses() {
            const order = ["investigating", "identified", "monitoring", "resolved"];
            let maxIndex = -1;

            if (this.updates && this.updates.length > 0) {
                this.updates.forEach((update) => {
                    const index = order.indexOf(update.status);
                    if (index > maxIndex) {
                        maxIndex = index;
                    }
                });
            }

            // Return valid statuses (index > maxIndex) plus "update"
            const valid = order.filter((status, index) => index > maxIndex);
            valid.push("update");
            return valid;
        },
    },
    watch: {
        availableStatuses: {
            immediate: true,
            handler(newVal) {
                // Ensure selected status is valid, otherwise default to first available
                if (!newVal.includes(this.form.status)) {
                    this.form.status = newVal[0];
                }
            },
        },
    },
    methods: {
        /**
         * Post a new incident update via socket
         * @returns {void}
         */
        postUpdate() {
            if (!this.form.message || this.form.message.trim() === "") {
                this.$root.toastError(this.$t("Please input message"));
                return;
            }

            this.processing = true;

            this.$root.getSocket().emit(
                "postIncidentUpdate",
                this.slug,
                this.incidentId,
                {
                    status: this.form.status,
                    message: this.form.message,
                },
                (res) => {
                    this.processing = false;
                    this.$root.toastRes(res);
                    if (res.ok) {
                        this.form.message = "";
                        this.$emit("update-posted", res.update, res.incident);
                    }
                }
            );
        },
    },
};
</script>

<style lang="scss" scoped>
.incident-update-form {
    margin-top: 12px;

    .card {
        background: rgba(255, 255, 255, 0.8);
        border-radius: 8px;
    }
}

.dark .incident-update-form .card {
    background: rgba(255, 255, 255, 0.05);
}
</style>
