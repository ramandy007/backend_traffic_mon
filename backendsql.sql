use TrafficMon;
create table IF NOT EXISTS `UserLogin` (`email` varchar(20),`password` varchar(20));

alter table UserLogin modify column password longtext;

desc UserLogin;
