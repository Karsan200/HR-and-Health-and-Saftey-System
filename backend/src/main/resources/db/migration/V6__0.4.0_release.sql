create table iot_device_table (
    created datetime(6) not null,
    extension varchar(8) not null,
    device_id uuid not null,
    access_token TEXT not null,
    scanning_interval int not null,
    upload_interval int not null,
    rssi_threshold int not null,
    last_activity datetime(6),
    primary key (device_id)
) engine=InnoDB;