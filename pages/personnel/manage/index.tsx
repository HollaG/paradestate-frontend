import React from "react";
import { NextProtectedPage } from "../../../lib/auth";

const PersonnelListPage: NextProtectedPage = () => {

    // Get all personnel, active / old as well
    
    return <>
    </>
};

PersonnelListPage.requireAuth = true;
export default React.memo(PersonnelListPage);
