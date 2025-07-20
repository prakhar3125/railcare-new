import { CATEGORY_KEYWORDS } from '../constants/categoryKeywords';

export const getAllCategories = () => {
    return Object.keys(CATEGORY_KEYWORDS);
};

export const getCategoryPriority = (category) => {
    return CATEGORY_KEYWORDS[category]?.priority || 'medium';
};

export const getCategoryConfidence = (category) => {
    return CATEGORY_KEYWORDS[category]?.confidence || 0.7;
};

export const getDepartmentStructure = () => {
    const structure = {};
    Object.entries(CATEGORY_KEYWORDS).forEach(([categoryName, categoryData]) => {
        const departments = new Set();
        categoryData.subcategories?.forEach(subcat => {
            subcat.departments?.forEach(dept => departments.add(dept));
        });
        structure[categoryName] = Array.from(departments);
    });
    return structure;
};
