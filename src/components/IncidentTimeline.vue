<template>
    <div class="incident-timeline" data-testid="incident-timeline">
        <div v-if="updates.length === 0 && !loading" class="text-muted small py-2">
            {{ $t("No updates yet") }}
        </div>

        <div v-if="loading" class="text-center py-2">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="visually-hidden">{{ $t("Loading...") }}</span>
            </div>
        </div>

        <div v-else class="timeline">
            <div v-for="update in updates" :key="update.id" class="timeline-item">
                <div class="timeline-marker" :class="statusClass(update.status)"></div>
                <div class="timeline-content">
                    <div class="d-flex justify-content-between align-items-start">
                        <span class="badge me-2" :class="statusBadgeClass(update.status)">
                            {{ $t(statusLabel(update.status)) }}
                        </span>
                        <div v-if="editMode" class="timeline-actions">
                            <button
                                class="btn btn-outline-secondary btn-sm me-1"
                                :title="$t('Edit')"
                                @click="$emit('edit-update', update)"
                            >
                                <font-awesome-icon icon="edit" />
                            </button>
                            <button
                                class="btn btn-outline-danger btn-sm"
                                :title="$t('Delete')"
                                @click="$emit('delete-update', update)"
                            >
                                <font-awesome-icon icon="trash" />
                            </button>
                        </div>
                    </div>
                    <!-- eslint-disable-next-line vue/no-v-html -->
                    <div class="timeline-message mt-2" v-html="getUpdateHTML(update.message)"></div>
                    <div class="timeline-date text-muted small mt-1">
                        {{ datetime(update.createdDate) }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { marked } from "marked";
import DOMPurify from "dompurify";
import datetimeMixin from "../mixins/datetime";

export default {
    name: "IncidentTimeline",
    mixins: [datetimeMixin],
    props: {
        updates: {
            type: Array,
            default: () => [],
        },
        editMode: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["edit-update", "delete-update"],
    methods: {
        /**
         * Get sanitized HTML for update message
         * @param {string} message - Markdown content
         * @returns {string} Sanitized HTML
         */
        getUpdateHTML(message) {
            if (message != null) {
                return DOMPurify.sanitize(marked(message));
            }
            return "";
        },

        /**
         * Get CSS class for timeline marker based on status
         * @param {string} status - Update status
         * @returns {string} CSS class
         */
        statusClass(status) {
            const map = {
                investigating: "marker-danger",
                identified: "marker-warning",
                monitoring: "marker-info",
                resolved: "marker-success",
                update: "marker-secondary",
            };
            return map[status] || "marker-secondary";
        },

        /**
         * Get Bootstrap badge class for status
         * @param {string} status - Update status
         * @returns {string} CSS class
         */
        statusBadgeClass(status) {
            const map = {
                investigating: "bg-danger",
                identified: "bg-warning text-dark",
                monitoring: "bg-info text-dark",
                resolved: "bg-success",
                update: "bg-secondary",
            };
            return map[status] || "bg-secondary";
        },

        /**
         * Get display label for status
         * @param {string} status - Update status
         * @returns {string} Display label
         */
        statusLabel(status) {
            const map = {
                investigating: "Investigating",
                identified: "Identified",
                monitoring: "Monitoring",
                resolved: "Resolved",
                update: "Update",
            };
            return map[status] || "Update";
        },
    },
};
</script>

<style lang="scss" scoped>
@import "../assets/vars.scss";

.incident-timeline {
    padding: 8px 0;
}

.timeline {
    position: relative;
    padding-left: 24px;

    &::before {
        content: "";
        position: absolute;
        left: 7px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #dee2e6;
    }
}

.timeline-item {
    position: relative;
    padding-bottom: 16px;

    &:last-child {
        padding-bottom: 0;
    }
}

.timeline-marker {
    position: absolute;
    left: -20px;
    top: 4px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid #fff;
    z-index: 1;

    &.marker-danger {
        background-color: $danger;
    }

    &.marker-warning {
        background-color: $warning;
    }

    &.marker-info {
        background-color: #0dcaf0;
    }

    &.marker-success {
        background-color: $primary;
    }

    &.marker-secondary {
        background-color: #6c757d;
    }
}

.timeline-content {
    padding: 8px 12px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.02);
    transition: background 0.15s ease;

    &:hover {
        background: rgba(0, 0, 0, 0.04);
    }
}

.timeline-message {
    font-size: 0.9rem;
    line-height: 1.5;
    word-break: break-word;
}

.timeline-date {
    font-size: 0.78rem;
}

.timeline-actions {
    flex-shrink: 0;
}

.dark {
    .timeline::before {
        background: $dark-border-color;
    }

    .timeline-marker {
        border-color: $dark-bg;
    }

    .timeline-content {
        background: rgba(255, 255, 255, 0.03);

        &:hover {
            background: rgba(255, 255, 255, 0.06);
        }
    }
}
</style>
