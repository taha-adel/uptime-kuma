<template>
    <div class="incident-group" data-testid="incident-group">
        <div v-if="loading && incidents.length === 0" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">{{ $t("Loading...") }}</span>
            </div>
        </div>

        <div v-else-if="incidents.length === 0" class="text-center py-4 text-muted">
            {{ $t("No incidents recorded") }}
        </div>

        <div v-else class="incident-list">
            <div
                v-for="incident in displayedIncidents"
                :key="incident.id"
                class="incident-item"
                :class="{ resolved: !incident.active }"
            >
                <div class="incident-body w-100">
                    <div class="d-flex justify-content-between align-items-start">
                        <router-link
                            :to="`/status/${$route.params.slug}/incidents/${incident.id}`"
                            class="text-decoration-none"
                        >
                            <h4
                                class="incident-title mb-2 text-start"
                                :style="{
                                    color: incident.style === 'danger' ? '#e36209' : '#dbab09',
                                    fontWeight: 'bold',
                                }"
                            >
                                {{ incident.title }}
                            </h4>
                        </router-link>

                        <div v-if="editMode" class="incident-actions flex-shrink-0 ms-2">
                            <button
                                v-if="incident.active"
                                class="btn btn-success btn-sm me-1"
                                :title="$t('Resolve')"
                                @click="$emit('resolve-incident', incident)"
                            >
                                <font-awesome-icon icon="check" />
                            </button>
                            <button
                                class="btn btn-outline-secondary btn-sm me-1"
                                :title="$t('Edit')"
                                @click="$emit('edit-incident', incident)"
                            >
                                <font-awesome-icon icon="edit" />
                            </button>
                            <button
                                class="btn btn-outline-danger btn-sm"
                                :title="$t('Delete')"
                                @click="$emit('delete-incident', incident)"
                            >
                                <font-awesome-icon icon="trash" />
                            </button>
                        </div>
                    </div>

                    <div class="incident-message mb-1 text-start" style="white-space: pre-wrap">
                        {{ getDisplayMessage(incident) }}
                    </div>

                    <div class="incident-meta text-muted small mt-1 text-start">
                        {{ formatDateRange(incident) }}
                    </div>
                </div>
            </div>
        </div>

        <div v-if="incidents.length > 3 && !expanded" class="mt-3">
            <button class="btn btn-light w-100 border text-muted" @click="expanded = true">
                + {{ $t("Show All") }} {{ incidents.length }} {{ $t("Incidents") }}
            </button>
        </div>

        <div v-if="incidents.length > 3 && expanded" class="mt-3">
            <button class="btn btn-light w-100 border text-muted" @click="expanded = false">
                - {{ $t("Collapse Incidents") }}
            </button>
        </div>
    </div>
</template>

<script>
import dayjs from "dayjs";
import datetimeMixin from "../mixins/datetime";

export default {
    name: "IncidentHistory",
    mixins: [datetimeMixin],
    props: {
        incidents: {
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
    emits: ["edit-incident", "delete-incident", "resolve-incident"],
    data() {
        return {
            expanded: false,
        };
    },
    computed: {
        displayedIncidents() {
            if (this.expanded) {
                return this.incidents;
            }
            return this.incidents.slice(0, 3);
        },
    },
    methods: {
        getDisplayMessage(incident) {
            if (incident.updates && incident.updates.length > 0) {
                const resolvedUpdate = incident.updates.find((u) => u.status === "resolved");
                if (resolvedUpdate) {
                    return resolvedUpdate.message;
                }
                const latestUpdate = incident.updates[incident.updates.length - 1];
                return latestUpdate.message;
            }
            return "";
        },
        formatDateRange(incident) {
            const start = dayjs.utc(incident.createdDate).tz(this.timezone);
            const startFormat = start.format("MMM D, HH:mm");

            if (incident.lastUpdatedDate && incident.createdDate !== incident.lastUpdatedDate) {
                const end = dayjs.utc(incident.lastUpdatedDate).tz(this.timezone);
                const endFormat = end.format("HH:mm");
                return `${startFormat} - ${endFormat} (${this.timezone})`;
            }
            return `${startFormat} (${this.timezone})`;
        },
    },
};
</script>

<style lang="scss" scoped>
.incident-group {
    margin-bottom: 2rem;
}

.incident-list {
    position: relative;
    padding-left: 20px;
}

.incident-list::before {
    content: "";
    position: absolute;
    top: 5px;
    bottom: 5px;
    left: 8px;
    width: 2px;
    background-color: #dee2e6;
}

.incident-item {
    position: relative;
    padding: 12px 16px;
    background-color: transparent;
    display: flex;
    align-items: flex-start;

    &::before {
        content: "!";
        position: absolute;
        left: -20px;
        top: 15px;
        width: 18px;
        height: 18px;
        background-color: #f8f9fa;
        color: #6c757d;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: bold;
        border: 2px solid #dee2e6;
        z-index: 1;
    }
}

.incident-message {
    font-size: 14px;
    line-height: 1.5;
}

.incident-title {
    transition: all 0.2s ease-in-out;

    &:hover {
        text-decoration: underline;
    }
}
</style>
