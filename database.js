
// نظام إدارة قاعدة بيانات JSON للتطبيق
const DB_FILE = 'app_database.json';
const DEFAULT_DATA = {
    version: "1.0",
    lastUpdated: new Date().toISOString(),
    movies: [],
    series: [],
    categories: {
        main: [
            { id: 'all', name: 'جميع الأفلام والمسلسلات', count: 0 },
            { id: 'old-arabic', name: 'أفلام عربية قديمة', count: 0 },
            { id: 'new-arabic', name: 'أفلام عربية جديدة', count: 0 },
            { id: 'series', name: 'المسلسلات', count: 0 },
            { id: 'foreign1', name: 'أفلام أجنبية 1', count: 0 },
            { id: 'foreign2', name: 'أفلام أجنبية 2', count: 0 },
            { id: 'foreign3', name: 'أفلام أجنبية 3', count: 0 },
            { id: 'horror', name: 'أفلام الرعب', count: 0 },
            { id: 'series-movies', name: 'سلاسل الأفلام', count: 0 },
            { id: 'stars', name: 'أفلام النجوم', count: 0 },
            { id: 'family', name: 'أفلام عائلية', count: 0 },
            { id: 'movie-sites', name: 'مواقع الأفلام', count: 0, isSites: true, shortcuts: [], folders: [] },
            { id: 'pages-section', name: 'قسم الصفحات', count: 0, isPagesSection: true, pages: [] }
        ],
        sub: [
            { id: 'selected1', name: 'أفلام مختارة 1', count: 0 },
            { id: 'selected2', name: 'أفلام مختارة 2', count: 0 },
            { id: 'favorite1', name: 'مفضلة أفلام 1', count: 0 },
            { id: 'favorite2', name: 'مفضلة أفلام 2', count: 0 }
        ],
        special: [
            { id: 'r1', name: 'قسم الأفلام R1', count: 0 },
            { id: 'r2', name: 'قسم الأفلام R2', count: 0 },
            { id: 's1', name: 'قسم الأفلام S1', count: 0 },
            { id: 's2', name: 'قسم الأفلام S2', count: 0 },
            { id: 's3', name: 'قسم الاكس S3', count: 0 },
            { id: 's-sites', name: 'قسم S SITES', count: 0 }
        ],
        specialSub: [
            { id: 'selected-rs1', name: 'أفلام مختارة R+S1', count: 0 },
            { id: 'selected-rs2', name: 'أفلام مختارة R+S2', count: 0 }
        ]
    },
    settings: {
        password: '5555',
        showSpecialSections: false,
        openMoviesExternally: true,
        zoomLevel: 1,
        currentPageTitle: 'New Koktil-aflam v32',
        viewMode: 'grid',
        sortBy: 'name',
        currentCategory: 'all',
        currentPage: 1,
        itemsPerPage: 50,
        cachedImages: {}
    }
};

// تحميل البيانات من ملف JSON
async function loadAppData() {
    try {
        // التحقق من وجود ملف قاعدة البيانات
        const response = await fetch(DB_FILE);
        if (!response.ok) {
            throw new Error('ملف قاعدة البيانات غير موجود');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.log('لا يوجد ملف قاعدة بيانات أو حدث خطأ أثناء تحميله، سيتم إنشاء ملف جديد:', error);
        return DEFAULT_DATA;
    }
}

// حفظ البيانات في ملف JSON
async function saveAppData(data) {
    try {
        // تحديث تاريخ آخر تحديث
        data.lastUpdated = new Date().toISOString();

        // استخدام Blob و URL.createObjectURL لحفظ الملف
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        // إنشاء رابط للتنزيل
        const a = document.createElement('a');
        a.href = url;
        a.download = DB_FILE;
        a.style.display = 'none';
        document.body.appendChild(a);
        
        // محاولة النقر المباشر
        try {
            a.click();
            console.log('تم حفظ البيانات بنجاح في ملف ' + DB_FILE);
        } catch (e) {
            console.error('فشل النقر المباشر:', e);
            // إذا فشل النقر المباشر، استخدم حدث النقر المخصص
            const event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            a.dispatchEvent(event);
        }

        // تنظيف
        setTimeout(() => {
            try {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (e) {
                console.log('خطأ أثناء تنظيف العناصر:', e);
            }
        }, 100);

        return true;
    } catch (error) {
        console.error('حدث خطأ أثناء حفظ البيانات:', error);
        return false;
    }
}

// دالة لتحديث الملف تلقائياً عند إضافة أو تعديل بيانات
function autoSaveData(data) {
    // تأكد من وجود البيانات
    if (!data || !data.movies || !data.categories) {
        console.error('بيانات غير صالحة للحفظ التلقائي');
        return false;
    }
    
    // حفظ البيانات تلقائياً
    return saveAppData(data);
}
}

// استيراد البيانات من ملف JSON
async function importAppData(file) {
    try {
        const reader = new FileReader();
        reader.onload = async function(e) {
            const data = JSON.parse(e.target.result);

            // التحقق من صحة البيانات المستوردة
            if (!data.movies || !data.categories || !data.settings) {
                throw new Error('ملف البيانات غير صالح');
            }

            // حفظ البيانات المستوردة
            const saved = await saveAppData(data);
            if (saved) {
                showNotification('تم استيراد البيانات بنجاح');
                
                // حفظ تلقائي في ملف app_database.json
                if (typeof autoSaveData === 'function') {
                    autoSaveData(data);
                }
                
                // إعادة تحميل الصفحة لتفعيل البيانات الجديدة
                setTimeout(() => {
                    location.reload();
                }, 1500);
            } else {
                showNotification('فشل حفظ البيانات المستوردة');
            }
        };
        reader.readAsText(file);
    } catch (error) {
        console.error('حدث خطأ أثناء استيراد البيانات:', error);
        showNotification('حدث خطأ أثناء استيراد البيانات: ' + error.message);
    }
}

// توليد معرف فريد
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// تحديث عدد العناصر في قسم معين
function updateCategoryCount(data, categoryId, change) {
    const updateCount = (categories) => {
        for (let category of categories) {
            if (category.id === categoryId) {
                category.count = (category.count || 0) + change;
                return true;
            }
        }
        return false;
    };

    // تحديث في الأقسام الرئيسية
    if (updateCount(data.categories.main)) return;

    // تحديث في الأقسام الفرعية
    if (updateCount(data.categories.sub)) return;

    // تحديث في الأقسام الخاصة
    if (updateCount(data.categories.special)) return;

    // تحديث في الأقسام الخاصة الفرعية
    if (updateCount(data.categories.specialSub)) return;
}

// إضافة فيلم جديد
function addMovie(data, movie) {
    // التحقق مما إذا كان القسم المحدد فرعيًا
    const isSubCategory = data.categories.sub.some(cat => cat.id === movie.category) ||
                        data.categories.specialSub.some(cat => cat.id === movie.category);

    // إذا كان قسم فرعي، نضعه في 'all'
    if (isSubCategory) {
        movie.category = 'all';
        movie.subCategories = [movie.category]; // حفظ القسم الأصلي كقسم فرعي
    }

    movie.id = generateUniqueId();
    movie.addedDate = new Date().toISOString();

    data.movies.push(movie);
    updateCategoryCount(data, movie.category, 1);

    return movie;
}

// حذف فيلم
function removeMovie(data, movieId) {
    const index = data.movies.findIndex(movie => movie.id === movieId);
    if (index !== -1) {
        const movie = data.movies[index];
        data.movies.splice(index, 1);
        updateCategoryCount(data, movie.category, -1);

        // تحديث الأقسام الفرعية إذا كانت موجودة
        if (movie.subCategories && movie.subCategories.length > 0) {
            movie.subCategories.forEach(subCat => {
                updateCategoryCount(data, subCat, -1);
            });
        }

        return true;
    }
    return false;
}

// تحديث بيانات الفيلم
function updateMovie(data, movieId, updatedMovie) {
    const index = data.movies.findIndex(movie => movie.id === movieId);
    if (index !== -1) {
        const oldMovie = data.movies[index];

        // استعادة العد القديم
        updateCategoryCount(data, oldMovie.category, -1);
        if (oldMovie.subCategories && oldMovie.subCategories.length > 0) {
            oldMovie.subCategories.forEach(subCat => {
                updateCategoryCount(data, subCat, -1);
            });
        }

        // تحديث البيانات
        data.movies[index] = { ...oldMovie, ...updatedMovie };

        // تحديث العد الجديد
        updateCategoryCount(data, data.movies[index].category, 1);
        if (data.movies[index].subCategories && data.movies[index].subCategories.length > 0) {
            data.movies[index].subCategories.forEach(subCat => {
                updateCategoryCount(data, subCat, 1);
            });
        }

        return true;
    }
    return false;
}

// البحث عن فيلم
function searchMovies(data, searchTerm) {
    const term = searchTerm.toLowerCase();
    return data.movies.filter(movie => 
        movie.name.toLowerCase().includes(term) || 
        movie.href.toLowerCase().includes(term)
    );
}

// تصدير البيانات إلى ملف JSON
function exportAppData(data) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'app_database_export.json';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
}

// إظهار إشعار
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// كشف ما إذا كان الملف قاعدة بيانات صالحة
function isValidDatabase(data) {
    return data && 
           data.movies && Array.isArray(data.movies) &&
           data.categories && 
           data.categories.main && Array.isArray(data.categories.main) &&
           data.categories.sub && Array.isArray(data.categories.sub) &&
           data.settings;
}

// تصدير الوظائف للاستخدام في ملفات أخرى
window.DatabaseManager = {
    loadAppData,
    saveAppData,
    importAppData,
    exportAppData,
    addMovie,
    removeMovie,
    updateMovie,
    searchMovies,
    generateUniqueId,
    isValidDatabase
};
