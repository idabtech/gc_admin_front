import React, {useState, useEffect} from 'react';
import {packageService} from '../../service/package.service';
import {toast} from 'sonner';
import PackageModal from './PackageModal';
import {Plus} from 'lucide-react';
import {C} from '../constants/data';

const PackageList = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({total: 0, page: 1, limit: 20, pages: 0});
    const [filters, setFilters] = useState({search: '', plan: '', label: '', isactive: ''});
    const [plans, setPlans] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('view');

    useEffect(() => {
        fetchPackages();
        fetchPlans();
    }, [pagination.page, filters]);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            };
            // Only add isactive if it's explicitly set in filters, otherwise default to true
            if (params.isactive === undefined || params.isactive === '') {
                params.isactive = true;
            }
            const response = await packageService.getPackages(params);
            setPackages(response.packages || []);
            setPagination(response.pagination || pagination);
        } catch (error) {
            toast.error('Failed to fetch packages');
            console.error('Error fetching packages:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPlans = async () => {
        try {
            const response = await packageService.getPackagePlans();
            setPlans(response.plans || []);
        } catch (error) {
            console.error('Error fetching plans:', error);
        }
    };

    const handleFilterChange = (e) => {
        const {name, value} = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setPagination(prev => ({
            ...prev,
            page: 1
        }));
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({
            ...prev,
            page: newPage
        }));
    };

    const handlePackageAction = (packageData, action) => {
        setSelectedPackage(packageData);
        setModalMode(action);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedPackage(null);
        setModalMode('view');
    };

    const handleActionComplete = () => {
        fetchPackages();
        handleModalClose();
    };

    const handleDeletePackage = async (packageId) => {
        if (!window.confirm('Are you sure you want to delete this package?')) {
            return;
        }

        try {
            await packageService.deletePackage(packageId);
            toast.success('Package deleted successfully');
            fetchPackages();
        } catch (error) {
            toast.error('Failed to delete package');
            console.error('Error deleting package:', error);
        }
    };

    const renderPagination = () => {
        const {page, pages} = pagination;
        if (pages <= 1) 
            return null;
        


        return (
            <div className="flex justify-center items-center space-x-2 mt-4">
                <button onClick={
                        () => handlePageChange(page - 1)
                    }
                    disabled={
                        page === 1
                    }
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">
                    Previous
                </button>
                <span className="px-3 py-1">
                    Page {page}
                    of {pages} </span>
                <button onClick={
                        () => handlePageChange(page + 1)
                    }
                    disabled={
                        page === pages
                    }
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">
                    Next
                </button>
            </div>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Package Management</h1>
                <button onClick={
                        () => handlePackageAction(null, 'create')
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    style={
                        {
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.85rem 1.5rem',
                            background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 8px 20px rgba(14, 165, 233, 0.3)'
                        }
                }>
                    <Plus size={18}/>
                    Create Package
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="text" name="search" placeholder="🔍 Search packages..."
                        value={
                            filters.search
                        }
                        onChange={handleFilterChange}
                        className="w-full pr-4 py-3 pl-4 rounded-lg border bg-white text-black placeholder-gray-400 transition-all focus:outline-none focus:ring-2"
                        style={
                            {
                                borderColor: C.border,
                                focusRing: '#3b82f6'
                            }
                        }
                        onFocus={
                            (e) => {
                                e.target.style.borderColor = '#3b82f6';
                                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                            }
                        }
                        onBlur={
                            (e) => {
                                e.target.style.borderColor = C.border;
                                e.target.style.boxShadow = 'none';
                            }
                        }/>
                    <select name="plan"
                        value={
                            filters.plan
                        }
                        onChange={handleFilterChange}
                        className="px-4 py-3 rounded-lg border bg-white text-black font-medium appearance-none cursor-pointer transition-all"
                        style={
                            {
                                borderColor: C.border,
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%236b7280' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 1rem center',
                                paddingRight: '2.5rem'
                            }
                    }>
                        <option value="">All Plans</option>
                        {
                        plans.map(plan => (
                            <option key={
                                    plan.plan
                                }
                                value={
                                    plan.plan
                            }>
                                {
                                plan.plan
                            }
                                ({
                                plan.count
                            })
                            </option>
                        ))
                    } </select>
                    <input type="text" name="label" placeholder="Filter by label"
                        value={
                            filters.label
                        }
                        onChange={handleFilterChange}
                        className="w-full pl-4 pr-4 py-3 rounded-lg border bg-white text-black placeholder-gray-400 transition-all focus:outline-none focus:ring-2"
                        style={
                            {
                                borderColor: C.border,
                                focusRing: '#3b82f6'
                            }
                        }
                        onFocus={
                            (e) => {
                                e.target.style.borderColor = '#3b82f6';
                                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                            }
                        }
                        onBlur={
                            (e) => {
                                e.target.style.borderColor = C.border;
                                e.target.style.boxShadow = 'none';
                            }
                        }/>
                    <select name="isactive"
                        value={
                            filters.isactive
                        }
                        onChange={handleFilterChange}
                        className="px-4 py-3 rounded-lg border bg-white text-black font-medium appearance-none cursor-pointer transition-all"
                        style={
                            {
                                borderColor: C.border,
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%236b7280' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 1rem center',
                                paddingRight: '2.5rem'
                            }
                    }>
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Package List */}
            {
            loading ? (
                <div className="text-center py-8">Loading packages...</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Label
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Plan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Title
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Duration
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {
                            packages.map((pkg) => (
                                <tr key={
                                    pkg.id
                                }>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {
                                        pkg.label
                                    } </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {
                                        pkg.plan || '-'
                                    } </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {
                                        pkg.title || '-'
                                    } </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {
                                        pkg.currency
                                    }
                                        {
                                        pkg.price
                                    } </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {
                                        pkg.durationInDays ? `${
                                            pkg.durationInDays
                                        } days` : '-'
                                    } </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={
                                            `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                pkg.isactive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`
                                        }>
                                            {
                                            pkg.isactive ? 'Active' : 'Inactive'
                                        } </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={
                                                () => handlePackageAction(pkg, 'view')
                                            }
                                            className="text-indigo-600 hover:text-indigo-900 mr-3">
                                            View
                                        </button>
                                        <button onClick={
                                                () => handlePackageAction(pkg, 'edit')
                                            }
                                            className="text-blue-600 hover:text-blue-900 mr-3">
                                            Edit
                                        </button>
                                        <button onClick={
                                                () => handleDeletePackage(pkg.id)
                                            }
                                            className="text-red-600 hover:text-red-900">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        } </tbody>
                    </table>
                    {
                    packages.length === 0 && !loading && (
                        <div className="text-center py-8 text-gray-500">
                            No packages found
                        </div>
                    )
                } </div>
            )
        }

            {
            renderPagination()
        }

            {/* Package Modal */}
            {
            isModalOpen && (
                <PackageModal isOpen={isModalOpen}
                    onClose={handleModalClose}
                    package={selectedPackage}
                    mode={modalMode}
                    onActionComplete={handleActionComplete}/>
            )
        } </div>
    );
};

export default PackageList;
