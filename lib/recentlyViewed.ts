import { Property } from "@/app/types";

const MAX_RECENT_VIEWS = 20;
const RECENT_VIEWS_KEY = "recentlyViewedListings";

export const addRecentlyViewed = (property: Property) => {
  try {
    const recentViews = getRecentlyViewed();

    const filteredViews = recentViews.filter((view) => view.id !== property.id);

    const updatedViews = [property, ...filteredViews].slice(
      0,
      MAX_RECENT_VIEWS
    );

    localStorage.setItem(RECENT_VIEWS_KEY, JSON.stringify(updatedViews));
  } catch (error) {
    console.error("Error saving recently viewed listing:", error);
  }
};

export const getRecentlyViewed = (): Property[] => {
  try {
    const views = localStorage.getItem(RECENT_VIEWS_KEY);
    return views ? JSON.parse(views) : [];
  } catch (error) {
    console.error("Error getting recently viewed listings:", error);
    return [];
  }
};

export const clearRecentlyViewed = () => {
  try {
    localStorage.removeItem(RECENT_VIEWS_KEY);
  } catch (error) {
    console.error("Error clearing recently viewed listings:", error);
  }
};
