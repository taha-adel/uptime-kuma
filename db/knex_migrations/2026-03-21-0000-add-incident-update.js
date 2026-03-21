exports.up = function (knex) {
    return knex.schema.createTable("incident_update", (table) => {
        table.increments("id");
        table
            .integer("incident_id")
            .unsigned()
            .notNullable()
            .references("id")
            .inTable("incident")
            .onDelete("CASCADE")
            .onUpdate("CASCADE");
        table.string("status", 50).notNullable().defaultTo("update");
        table.text("message").notNullable();
        table.datetime("created_date").notNullable().defaultTo(knex.fn.now());

        table.index("incident_id", "incident_update_incident_id");
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("incident_update");
};
