DELIMITER $$

CREATE TRIGGER number_format 
    BEFORE INSERT ON client FOR EACH ROW
    BEGIN
        IF LENGTH(NEW.contact) >13
            THEN SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'FORMAT NOT ACCEPTABLE';
                END IF; 
    END
$$

DELIMITER ;


DELIMITER $$

CREATE TRIGGER policy_company 
    BEFORE INSERT ON insurancepolicy FOR EACH ROW
    BEGIN
        IF (NEW.policytype,NEW.company_id) EXISTS IN (
            SELECT policytype,company_id FROM insurancepolicy
        );
        THEN ;
        END IF;
    END
$$

DELIMITER ;

