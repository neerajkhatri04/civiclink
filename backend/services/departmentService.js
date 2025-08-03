const { db } = require('../config/firebase');

const getDepartmentInfo = async (issueKeyword, locationZone) => {
  try {
    console.log(`Searching for department: keyword=${issueKeyword}, zone=${locationZone}`);

    const departmentsRef = db.collection('departments');

    // Query for departments that handle the issue type and serve the zone
    const snapshot = await departmentsRef
      .where('handlesIssues', 'array-contains', issueKeyword.toLowerCase())
      .where('jurisdiction', '==', locationZone)
      .get();

    if (snapshot.empty) {
      // Try a broader search without zone restriction
      const broadSnapshot = await departmentsRef
        .where('handlesIssues', 'array-contains', issueKeyword.toLowerCase())
        .get();

      if (broadSnapshot.empty) {
        return {
          success: false,
          error: `No department found for issue: ${issueKeyword}`
        };
      }

      // Return the first match from broader search
      const doc = broadSnapshot.docs[0];
      return {
        success: true,
        department: {
          id: doc.id,
          ...doc.data()
        }
      };
    }

    // Return the first matching department
    const doc = snapshot.docs[0];
    return {
      success: true,
      department: {
        id: doc.id,
        ...doc.data()
      }
    };

  } catch (error) {
    console.error('Error getting department info:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const getAllDepartments = async () => {
  try {
    const snapshot = await db.collection('departments').get();
    const departments = [];

    snapshot.forEach(doc => {
      departments.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return { success: true, departments };
  } catch (error) {
    console.error('Error getting departments:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  getDepartmentInfo,
  getAllDepartments
};
