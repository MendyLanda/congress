import { UserRole } from "../enums/user-role.enum";
import { SupportRecommendation } from "../interfaces/support-recommendation.interface";

export const rolesHierarchy: UserRole[] = [UserRole.manager, UserRole.welfareCommittee, UserRole.welfareDepartment, UserRole.coordinator];

export const getRolesHierarchyIndex = (role: UserRole) => rolesHierarchy.findIndex(r => r == role)

export const isRolesInHigherHierarchy = (a: UserRole, b: UserRole) => getRolesHierarchyIndex(a) <= getRolesHierarchyIndex(b)

export const isUpdatingRecommendationAllowed = (recommendation: SupportRecommendation[], userRole: UserRole) => {
    recommendation = recommendation
        .sort((a, b) => getRolesHierarchyIndex(a.recommenderType) - getRolesHierarchyIndex(b.recommenderType));

    return getRolesHierarchyIndex(recommendation[0].recommenderType) >= getRolesHierarchyIndex(userRole)
}