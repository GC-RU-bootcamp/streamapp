CREATE DATABASE sessionMgrDB;
USE sessionMgrDB;

CREATE TABLE people (
  id         INTEGER(11) AUTO_INCREMENT NOT NULL,
  logon_id   VARCHAR(50)  NOT NULL,
  logon_pwd  VARCHAR(50)  NOT NULL,
  fst_nam    VARCHAR(50)  NOT NULL,
  lst_nam    VARCHAR(50)  NOT NULL,
  email_adr  VARCHAR(100) NOT NULL,
  cell_phone VARCHAR(20)  NOT NULL,
  role       VARCHAR(30)  NOT NULL,
  acct_lock  BOOLEAN,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50)  NOT NULL,
  lst_mod_at TIMESTAMP    NULL,
  lst_mod_by VARCHAR(50),
  PRIMARY KEY ( id ) 
);


CREATE TABLE people_lgn_hist (
  id         INTEGER(11)  AUTO_INCREMENT NOT NULL,
  people_id  INTEGER(11)  NOT NULL,
  logon_id   VARCHAR(50)  NOT NULL,
  created_at TIMESTAMP     NOT NULL,
  created_by VARCHAR(50)  NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE sessions (
  id             INTEGER(11) AUTO_INCREMENT NOT NULL,
  people_id      INTEGER(11)    NOT NULL,
  name           VARCHAR(255)   NOT NULL,
  description    VARCHAR(2000)  NOT NULL,
  item_date      TIMESTAMP       NOT NULL,
  cost           DECIMAL(10,2)  NOT NULL,
  conn_info      VARCHAR(512)   NOT NULL,
  min_attendees  INTEGER,
  max_attendees  INTEGER,
  confirmed      BOOLEAN,
  item_sesn_type VARCHAR(255),
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by     VARCHAR(50)  NOT NULL,
  lst_mod_at     TIMESTAMP    NULL ,
  lst_mod_by     VARCHAR(50)  ,
  PRIMARY KEY(id),
  CONSTRAINT FOREIGN KEY sessions_fk1 (people_id) REFERENCES people(id)

 );

-- Keeps master list of search tags to control session search
 CREATE TABLE search_tags (
  id             INTEGER(11) AUTO_INCREMENT NOT NULL,
  tag            VARCHAR(50),
  PRIMARY KEY (id)  
 );

-- Associates tags to sessions for returning the session
 CREATE TABLE session_tags (
  session_id  INTEGER(11),
  tag              VARCHAR(50),
  PRIMARY KEY(tag,session_id)
 );

-- people_session keeps track of each person signed up
-- for a session with a host.
 CREATE TABLE people_session (
  people_id       INTEGER(11)  NOT NULL,
  session_id      INTEGER(11)  NOT NULL,
  comment         VARCHAR(2000),
  rating          INTEGER,
  attended        BOOLEAN,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by      VARCHAR(50)   NOT NULL,
  lst_mod_at      TIMESTAMP     NULL,
  lst_mod_by      VARCHAR(50)  ,
  PRIMARY KEY(people_id,session_id),
  CONSTRAINT FOREIGN KEY people_session_fk1 (people_id) REFERENCES people(id),
  CONSTRAINT FOREIGN KEY people_session_fk1 (session_id) REFERENCES sessions(id)
 );

 CREATE TABLE host_profile (
  people_id       INTEGER(11)  NOT NULL,
  avg_rating      DECIMAL(10,1),
  bio             VARCHAR(2000),
  created_at      TIMESTAMP     NOT NULL,
  created_by      VARCHAR(50)  NOT NULL,
  lst_mod_at      TIMESTAMP     NULL,
  lst_mod_by      VARCHAR(50)  ,
  photo           BLOB,
  PRIMARY KEY(people_id),
  CONSTRAINT FOREIGN KEY host_profile_fk1 (people_id) REFERENCES people(id)    
 );
