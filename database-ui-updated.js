
// واجهة إدارة قاعدة البيانات
function initializeDatabaseUI() {
    try {
        // التحقق من وجود عناصر واجهة المستخدم
        const settingsModal = document.getElementById('settings-modal');
        const settingsTabs = document.querySelector('.settings-tabs');

        if (!settingsModal || !settingsTabs) {
            console.error('لم يتم العثور على عناصر واجهة المستخدم اللازمة لإدارة قاعدة البيانات');
            return;
        }

        // تأخير إضافي لضمان تحميل جميع المكونات
        setTimeout(() => {
            try {

    // إضافة تبويب قاعدة البيانات
    const databaseTab = document.createElement('button');
    databaseTab.className = 'tab-btn';
    databaseTab.setAttribute('data-tab', 'database');
    databaseTab.innerHTML = '<i class="fas fa-database"></i> قاعدة البيانات';
    settingsTabs.appendChild(databaseTab);

    // إضافة محتوى تبويب قاعدة البيانات
    const databaseTabContent = document.createElement('div');
    databaseTabContent.id = 'database-tab';
    databaseTabContent.className = 'tab-content';

    databaseTabContent.innerHTML = `
        <h3>إدارة قاعدة البيانات</h3>
        <div class="settings-section">
            <h4>استيراد البيانات</h4>
            <div class="form-group">
                <label>استيراد قاعدة البيانات من ملف JSON:</label>
                <div class="import-dropzone" id="db-import-dropzone">
                    <p>اسحب وأفلت ملف قاعدة البيانات هنا</p>
                    <p>أو</p>
                    <label for="db-import-file" class="btn">اختر ملفًا</label>
                    <input type="file" id="db-import-file" accept=".json">
                </div>
                <button id="import-db-btn" class="btn" style="margin-top: 10px;">استيراد البيانات</button>
            </div>
            <div class="form-group">
                <p class="info-text">سيتم استيراد جميع الأفلام والمسلسلات والأقسام والإعدادات من الملف المحدد.</p>
            </div>
        </div>

        <div class="settings-section">
            <h4>تصدير البيانات</h4>
            <div class="form-group">
                <label>تصدير قاعدة البيانات إلى ملف JSON:</label>
                <p class="info-text">سيتم تصدير جميع البيانات الحالية إلى ملف JSON يمكن استيراده لاحقًا.</p>
                <div class="export-options">
                    <button id="export-db-btn" class="btn">تصدير قاعدة البيانات</button>
                    <select id="export-filename-select">
                        <option value="app_database_export.json">app_database_export.json (للاستيراد)</option>
                        <option value="app_database.json">app_database.json (لاستخدام مباشر)</option>
                    </select>
                    <button id="export-db-to-app-folder" class="btn">تصدير إلى مجلد التطبيق</button>
                    <p class="info-text" style="margin-top: 10px;">سيتم حفظ البيانات مباشرة في ملف app_database.json داخل مجلد التطبيق، مما يسمح برفع المجلد كاملاً مع البيانات إلى الاستضافة.</p>
                </div>
            </div>
        </div>

        <div class="settings-section">
            <h4>إدارة التخزين</h4>
            <div class="form-group">
                <button id="clear-local-storage" class="btn warning">مسح التخزين المحلي</button>
                <p class="info-text">سيتم مسح جميع البيانات المخزنة في المتصفح (localForage).</p>
            </div>
            <div class="form-group">
                <button id="backup-db-btn" class="btn">إنشاء نسخة احتياطية</button>
                <p class="info-text">سيتم إنشاء نسخة احتياطية من قاعدة البيانات الحالية وتنزيلها.</p>
            </div>
        </div>

        <div class="settings-actions">
            <button id="refresh-db-btn">تحديث قاعدة البيانات</button>
            <button id="reset-db-btn">إعادة تعيين قاعدة البيانات</button>
        </div>
    `;

    // إضافة المحتوى إلى نهاية إعدادات النموذج
    const settingsContent = document.getElementById('settings-content');
    settingsContent.appendChild(databaseTabContent);

    // إضافة معالجات الأحداث
    setupDatabaseEventHandlers();
            } catch (error) {
                console.error('حدث خطأ أثناء إعداد عناصر واجهة قاعدة البيانات:', error);
            }
        }, 500);
    } catch (error) {
        console.error('حدث خطأ أثناء تهيئة واجهة قاعدة البيانات:', error);
    }
}

// إعداد معالجات أحداث قاعدة البيانات
function setupDatabaseEventHandlers() {
    try {
    // معالج استيراد قاعدة البيانات
    const importDbBtn = document.getElementById('import-db-btn');
    const dbImportFile = document.getElementById('db-import-file');
    const dbImportDropzone = document.getElementById('db-import-dropzone');

    if (importDbBtn) {
        importDbBtn.addEventListener('click', async () => {
            const file = dbImportFile.files[0];
            if (!file) {
                showNotification('يرجى اختيار ملف للاستيراد');
                return;
            }

            try {
                if (typeof DatabaseManager !== 'undefined') {
                    await DatabaseManager.importAppData(file);
                } else {
                    showNotification('نظام قاعدة البيانات غير متوفر');
                }
            } catch (error) {
                console.error('خطأ أثناء استيراد قاعدة البيانات:', error);
                showNotification('حدث خطأ أثناء استيراد قاعدة البيانات: ' + error.message);
            }
        });
    }

    // معالج تصدير قاعدة البيانات
    const exportDbBtn = document.getElementById('export-db-btn');
    const exportDbToAppFolderBtn = document.getElementById('export-db-to-app-folder');
    const exportFilenameSelect = document.getElementById('export-filename-select');

    if (exportDbBtn) {
        exportDbBtn.addEventListener('click', () => {
            try {
                // تأكد من وجود appState
                if (!appState || !appState.movies || !appState.categories) {
                    showNotification('بيانات التطبيق غير متوفرة');
                    return;
                }

                // اسم الملف هو app_database.json
                const exportFileName = 'app_database.json';

                // تحضير بيانات قاعدة البيانات
                const dbData = {
                    version: "1.0",
                    movies: appState.movies || [],
                    series: appState.series || [],
                    categories: appState.categories || {},
                    settings: {
                        password: appState.password || '5555',
                        showSpecialSections: appState.showSpecialSections || false,
                        viewMode: appState.viewMode || 'grid',
                        sortBy: appState.sortBy || 'name',
                        selectedSite: appState.selectedSite || '',
                        selectedStar: appState.selectedStar || '',
                        itemsPerPage: appState.itemsPerPage || 50,
                        openMoviesExternally: appState.openMoviesExternally !== undefined ? appState.openMoviesExternally : true,
                        zoomLevel: appState.zoomLevel || 1,
                        currentPageTitle: appState.currentPageTitle || 'New Koktil-aflam v32',
                        lastUpdated: new Date().toISOString()
                    }
                };

                // تحديث تاريخ آخر تحديث
                dbData.settings.lastUpdated = new Date().toISOString();

                // إنشاء محتوى JSON
                const dataStr = JSON.stringify(dbData, null, 2);

                // إنشاء محتوى نصي للملف
                const dataStr = JSON.stringify(dbData, null, 2);

                // إنشاء رابط للتنزيل
                const downloadUrl = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

                // إنشاء عنصر <a> للتنزيل
                const downloadLink = document.createElement('a');
                downloadLink.href = downloadUrl;
                downloadLink.download = 'app_database.json';
                downloadLink.target = '_blank';
                downloadLink.style.display = 'none';

                // إضافة الرابط إلى الصفحة
                document.body.appendChild(downloadLink);

                // محاولة تنزيل الملف
                setTimeout(() => {
                    try {
                        // محاولة النقر المباشر
                        downloadLink.click();

                        // إذا فشل النقر المباشر، استخدم حدث النقر المخصص
                        setTimeout(() => {
                            try {
                                // إخفاء الرابط
                                downloadLink.style.display = 'none';

                                // تنظيف العناصر بعد فترة
                                setTimeout(() => {
                                    try {
                                        document.body.removeChild(downloadLink);
                                    } catch (e) {
                                        console.log('خطأ أثناء تنظيف العناصر:', e);
                                    }
                                }, 1000);

                                // إظهار رسالة نجاح
                                showNotification('تم تصدير قاعدة البيانات بنجاح باسم: app_database.json');
                            } catch (e) {
                                console.error('فشل عملية النقر:', e);
                                showNotification('حدث خطأ أثناء محاولة تنزيل الملف');
                            }
                        }, 100);
                    } catch (e) {
                        console.error('فشل عملية النقر:', e);
                        showNotification('حدث خطأ أثناء محاولة تنزيل الملف');
                    }
                }, 100);

                // تنظيف العناصر الأصلية
                setTimeout(() => {
                    try {
                        document.body.removeChild(linkElement);
                        URL.revokeObjectURL(url);
                    } catch (e) {
                        console.log('خطأ أثناء تنظيف العناصر:', e);
                    }
                }, 1000);
            } catch (error) {
                console.error('خطأ أثناء تصدير قاعدة البيانات:', error);
                showNotification('حدث خطأ أثناء تصدير قاعدة البيانات: ' + error.message);
            }
        });
    }

    // معالج تصدير قاعدة البيانات مباشرة إلى مجلد التطبيق
    if (exportDbToAppFolderBtn) {
        exportDbToAppFolderBtn.addEventListener('click', () => {
            try {
                // تأكد من وجود appState
                if (!appState || !appState.movies || !appState.categories) {
                    showNotification('بيانات التطبيق غير متوفرة');
                    return;
                }

                // تحضير بيانات قاعدة البيانات
                const dbData = {
                    version: "1.0",
                    movies: appState.movies || [],
                    series: appState.series || [],
                    categories: appState.categories || {},
                    settings: {
                        password: appState.password || '5555',
                        showSpecialSections: appState.showSpecialSections || false,
                        viewMode: appState.viewMode || 'grid',
                        sortBy: appState.sortBy || 'name',
                        selectedSite: appState.selectedSite || '',
                        selectedStar: appState.selectedStar || '',
                        itemsPerPage: appState.itemsPerPage || 50,
                        openMoviesExternally: appState.openMoviesExternally !== undefined ? appState.openMoviesExternally : true,
                        zoomLevel: appState.zoomLevel || 1,
                        currentPageTitle: appState.currentPageTitle || 'New Koktil-aflam v32',
                        lastUpdated: new Date().toISOString()
                    }
                };

                // تحديث تاريخ آخر تحديث
                dbData.settings.lastUpdated = new Date().toISOString();

                // إنشاء محتوى JSON
                const dataStr = JSON.stringify(dbData, null, 2);

                // إنشاء Blob من محتوى JSON
                const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });

                // إنشاء رابط للتنزيل
                const url = URL.createObjectURL(blob);

                // إنشاء رابط للتنزيل باسم app_database.json
                const linkElement = document.createElement('a');
                linkElement.style.display = 'none';
                linkElement.setAttribute('href', url);
                linkElement.setAttribute('download', 'app_database.json');
                linkElement.setAttribute('target', '_blank');
                
                // إضافة نوع MIME الصحيح
                linkElement.setAttribute('type', 'application/json');

                // إضافة العنصر إلى الصفحة
                document.body.appendChild(linkElement);

                // فرض تحديث الصفحة قليلاً لضمان تسجيل الرابط
                document.body.offsetHeight;

                // استخدام طريقة مباشرة لتنزيل الملف
                const downloadFile = () => {
                    try {
                        // إنشاء رابط مؤقت للتنزيل
                        const downloadUrl = URL.createObjectURL(blob);

                        // إنشاء عنصر <a> للتنزيل
                        const downloadLink = document.createElement('a');
                        downloadLink.href = downloadUrl;
                        downloadLink.download = 'app_database.json';

                        // إضافة الرابط إلى الصفحة
                        document.body.appendChild(downloadLink);

                        // محاولة تنزيل الملف
                        if (document.createEvent) {
                            const event = document.createEvent('MouseEvents');
                            event.initEvent('click', true, true);
                            downloadLink.dispatchEvent(event);
                        } else {
                            downloadLink.click();
                        }

                        // إزالة الرابط بعد التنزيل
                        setTimeout(() => {
                            document.body.removeChild(downloadLink);
                            URL.revokeObjectURL(downloadUrl);
                        }, 100);

                        return true;
                    } catch (error) {
                        console.error('خطأ في عملية التنزيل:', error);
                        return false;
                    }
                };

                // محاولة تنزيل الملف
                if (!downloadFile()) {
                    showNotification('فشل عملية التنزيل. حاول مرة أخرى.');
                } else {
                    showNotification('تم تصدير قاعدة البيانات إلى ملف app_database.json بنجاح. يمكنك الآن رفع المجلد كاملاً إلى الاستضافة.');
                }

                // تنظيف العناصر الأصلية
                setTimeout(() => {
                    try {
                        document.body.removeChild(linkElement);
                        URL.revokeObjectURL(url);
                    } catch (e) {
                        console.log('خطأ أثناء تنظيف العناصر:', e);
                    }
                }, 1000);
            } catch (error) {
                console.error('خطأ أثناء تصدير قاعدة البيانات إلى مجلد التطبيق:', error);
                showNotification('حدث خطأ أثناء تصدير قاعدة البيانات إلى مجلد التطبيق: ' + error.message);
            }
        });
    }

    // معالج إنشاء نسخة احتياطية
    const backupDbBtn = document.getElementById('backup-db-btn');
    if (backupDbBtn) {
        backupDbBtn.addEventListener('click', () => {
            try {
                // تحضير بيانات قاعدة البيانات
                const dbData = {
                    version: "1.0",
                    movies: appState.movies,
                    series: appState.series,
                    categories: appState.categories,
                    settings: {
                        password: appState.password,
                        showSpecialSections: appState.showSpecialSections,
                        viewMode: appState.viewMode,
                        sortBy: appState.sortBy,
                        selectedSite: appState.selectedSite,
                        selectedStar: appState.selectedStar,
                        itemsPerPage: appState.itemsPerPage,
                        openMoviesExternally: appState.openMoviesExternally,
                        zoomLevel: appState.zoomLevel,
                        currentPageTitle: appState.currentPageTitle,
                        backupDate: new Date().toISOString()
                    }
                };

                // إنشاء ملف مؤقت للتنزيل
                const dataStr = JSON.stringify(dbData, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

                const exportFileDefaultName = `app_database_backup_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;

                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();

                showNotification('تم إنشاء النسخة الاحتياطية بنجاح');
            } catch (error) {
                console.error('خطأ أثناء إنشاء النسخة الاحتياطية:', error);
                showNotification('حدث خطأ أثناء إنشاء النسخة الاحتياطية: ' + error.message);
            }
        });
    }

    // معالج تحديث قاعدة البيانات
    const refreshDbBtn = document.getElementById('refresh-db-btn');
    if (refreshDbBtn) {
        refreshDbBtn.addEventListener('click', () => {
            showNotification('جاري تحديث قاعدة البيانات...');
            setTimeout(() => {
                location.reload();
            }, 1000);
        });
    }

    // معالج إعادة تعيين قاعدة البيانات
    const resetDbBtn = document.getElementById('reset-db-btn');
    if (resetDbBtn) {
        resetDbBtn.addEventListener('click', () => {
            if (confirm('هل أنت متأكد من أنك تريد إعادة تعيين قاعدة البيانات؟ سيتم حذف جميع البيانات الحالية وسيتم استبدالها بالبيانات الافتراضية. هذه العملية لا يمكن التراجع عنها.')) {
                try {
                    if (typeof DatabaseManager !== 'undefined') {
                        // إعادة تعيين البيانات إلى القيم الافتراضية
                        appState.movies = [];
                        appState.series = [];
                        appState.categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
                        appState.password = '5555';
                        appState.showSpecialSections = false;
                        appState.viewMode = 'grid';
                        appState.sortBy = 'name';
                        appState.selectedSite = '';
                        appState.selectedStar = '';
                        appState.itemsPerPage = 50;
                        appState.openMoviesExternally = true;
                        appState.zoomLevel = 1;
                        appState.currentPageTitle = 'New Koktil-aflam v32';

                        // تحديث العرض
                        updateCategoriesCounts();
                        renderCategories();
                        displayMovies('all', 1);

                        // إخفاء/إظهار الأقسام الخاصة بناءً على الإعدادات
                        toggleSpecialSectionsVisibility();

                        // تطبيق مستوى التكبير المحفوظ
                        applyZoom();

                        // حفظ البيانات
                        saveAppData();

                        showNotification('تم إعادة تعيين قاعدة البيانات بنجاح');
                    } else {
                        showNotification('نظام قاعدة البيانات غير متوفر');
                    }
                } catch (error) {
                    console.error('خطأ أثناء إعادة تعيين قاعدة البيانات:', error);
                    showNotification('حدث خطأ أثناء إعادة تعيين قاعدة البيانات: ' + error.message);
                }
            }
        });
    }

    // معالج السحب والإفلة لمنطقة الاستيراد
    if (dbImportDropzone) {
        dbImportDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dbImportDropzone.classList.add('dragover');
        });

        dbImportDropzone.addEventListener('dragleave', () => {
            dbImportDropzone.classList.remove('dragover');
        });

        dbImportDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dbImportDropzone.classList.remove('dragover');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                dbImportFile.files = files;
            }
        });
    }
    } catch (error) {
        console.error('حدث خطأ أثناء إعداد معالجات أحداث قاعدة البيانات:', error);
    }
}
