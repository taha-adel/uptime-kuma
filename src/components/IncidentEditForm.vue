<template>
    <div class="shadow-box mb-4 p-4 incident" data-testid="incident-edit">
        <div class="mb-3">
            <label class="form-label">{{ $t("Title") }}</label>
            <input
                :value="modelValue.title"
                type="text"
                class="form-control"
                data-testid="incident-title"
                required
                @input="updateField('title', $event.target.value)"
            />
        </div>

        <div class="mb-4">
            <label class="form-label">{{ $t("Urgency") }}</label>
            <select
                :value="modelValue.style || 'warning'"
                class="form-select"
                @change="updateField('style', $event.target.value)"
            >
                <option value="warning">{{ $t("Warning") }}</option>
                <option value="danger">{{ $t("Critical") }}</option>
            </select>
        </div>

        <div class="mt-3">
            <button class="btn btn-primary me-2" data-testid="post-incident-button" @click="$emit('post')">
                <font-awesome-icon icon="bullhorn" />
                {{ $t("Post") }}
            </button>

            <button class="btn btn-secondary me-2" @click="$emit('cancel')">
                <font-awesome-icon icon="times" />
                {{ $t("Cancel") }}
            </button>
        </div>
    </div>
</template>

<script>
export default {
    name: "IncidentEditForm",
    props: {
        modelValue: {
            type: Object,
            required: true,
        },
    },
    emits: ["update:modelValue", "post", "cancel"],
    methods: {
        updateField(field, value) {
            this.$emit("update:modelValue", {
                ...this.modelValue,
                [field]: value,
            });
        },
    },
};
</script>
