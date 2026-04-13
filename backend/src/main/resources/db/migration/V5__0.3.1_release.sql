alter table hazard_table
    add signature_required BOOLEAN DEFAULT TRUE not null after action_complete;

alter table document_table
    add signature_required BOOLEAN DEFAULT FALSE not null after title;