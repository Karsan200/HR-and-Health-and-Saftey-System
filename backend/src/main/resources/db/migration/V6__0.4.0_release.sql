alter table account_table
    add constraint UKia9q7o6xtcuckl8ywdvrgre2c
        unique (ble_signature);

ALTER TABLE clock_in_event_table
DROP PRIMARY KEY,
    DROP COLUMN clock_in_event_id;

ALTER TABLE clock_in_event_table
    ADD COLUMN clock_in_event_id UUID NOT NULL DEFAULT (UUID()),
    ADD PRIMARY KEY (clock_in_event_id);

alter table document_table
    modify signature_required tinyint(1) default 0 not null first;

alter table hazard_table
    modify signature_required tinyint(1) default 1 not null after priority;

create table clock_in_report_table
(
    account_id bigint      not null,
    created    datetime(6) not null,
    report_id  bigint auto_increment
        primary key,
    clock_id   uuid        not null,
    issue      text        not null,
    constraint FK1h8nkcutp9mrtdi3cg4e7cgel
        foreign key (account_id) references account_table (account_id),
    constraint FKd28je2io8qjvc2v13ioyytnrl
        foreign key (clock_id) references clock_in_table (clock_id)
)
    collate = utf8mb4_uca1400_ai_ci;

create table iot_device_table
(
    rssi_threshold    int default -75 not null,
    scanning_interval int default 30  not null,
    upload_interval   int default 120 not null,
    created           datetime(6)     not null,
    last_activity     datetime(6)     null,
    device_id         uuid            not null
        primary key,
    access_token      text            not null
)
    collate = utf8mb4_uca1400_ai_ci;

alter table clock_in_table
    alter column created set default (current_timestamp(6));

alter table clock_in_table
    add is_admin_adjusted bit default b'0' not null after clock_out;