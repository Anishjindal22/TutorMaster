import React, { useEffect, useState } from 'react'
import Footer from '../components/common/Footer'
import { useParams } from 'react-router-dom'
import { apiConnector } from '../services/apiconnector';
import { categories } from '../services/apis';
import { getCatalogaPageData } from '../services/operations/pageAndComponentData';
import CourseCard from '../components/core/Catalog/Course_Card';
import CourseSlider from '../components/core/Catalog/CourseSlider';

const Catalog = () => {

    const {catalogName} = useParams();
    
    const [catalogPageData, setCatalogPageData] = useState(null);
    const [categoryId, setCategoryId] = useState("");
    const [active, setActive] = useState(1)
    const [loading, setLoading] = useState(false)
    
    useEffect(()=> {
        const getCategories = async() => {
            setLoading(true)
            const res = await apiConnector("GET", categories.CATEGORIES_API);
            const category_id = 
            res?.data?.data?.filter((ct) => ct.name.split(" ").join("-").toLowerCase() === catalogName.split(" ").join("-").toLowerCase())[0]?._id;
            setCategoryId(category_id);
        }
        getCategories();
    },[catalogName]);

    useEffect(() => {
        const getCategoryDetails = async() => {
            setLoading(true)
            try{
                const res = await getCatalogaPageData(categoryId);
                if (res.success) {
                    setCatalogPageData(res);
                }
                else{
                    setCatalogPageData(null)
                }
                setLoading(false)
            }
            catch(error) {
                console.log(error)
                setLoading(false)
            }
        }
        if(categoryId) {
            getCategoryDetails();
        }
        
    },[categoryId]);
    
    if(loading){
        return (
        <div className='min-h-[calc(100vh-3.5rem)] flex justify-center items-center bg-surface-dark'>
            <div className="spinner"></div>
        </div>
    )}
    else{
        return (
            <div className="bg-surface-dark min-h-screen pt-14 text-text-main">
                {
                    (!catalogPageData) ? 
                    (<div className='flex items-center justify-center min-h-[50vh] text-2xl font-bold text-text-muted'>
                        No Courses found for this category. 
                     </div>) 
                    :(
                        <>    
            <div className="relative border-b border-surface-border bg-surface-dim/40 backdrop-blur-md overflow-hidden py-16">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-brand-primary/10 to-transparent"></div>
                <div className="mx-auto flex flex-col justify-center gap-4 max-w-maxContent w-11/12 relative z-10 px-4">
                    <p className="text-sm font-medium text-text-muted tracking-wide flex gap-2">
                        <span className="hover:text-white transition-colors cursor-pointer">Home</span> / 
                        <span className="hover:text-white transition-colors cursor-pointer">Catalog</span> / 
                        <span className="text-brand-secondary font-bold">
                            {catalogPageData?.name}
                        </span>
                    </p>
                    <h1 className="text-5xl font-extrabold text-white mt-4 drop-shadow-lg"> {catalogPageData?.name} </h1>
                    <p className="max-w-[800px] text-lg text-text-faint font-inter mt-2 leading-relaxed"> {catalogPageData?.description}</p>
                </div>
            </div>
        
            <div className="pb-16">
                {/* section1 */}
                <div className=" mx-auto w-11/12 max-w-maxContent px-4 py-16">
                    <div className="text-3xl font-extrabold text-white mb-6">Courses to get you started</div>
                    <div className="my-6 flex border-b border-surface-border text-base font-semibold">
                        <p
                            className={`px-6 py-3 cursor-pointer transition-all duration-300 ${
                            active === 1
                                ? "border-b-2 border-brand-secondary text-brand-secondary shadow-glow-cyan"
                                : "text-text-muted hover:text-white hover:bg-surface-light rounded-t-lg"
                            }`}
                            onClick={() => setActive(1)}
                        >
                            Most Popular
                        </p>
                        <p
                            className={`px-6 py-3 cursor-pointer transition-all duration-300 ${
                            active === 2
                                ? "border-b-2 border-brand-secondary text-brand-secondary shadow-glow-cyan"
                                : "text-text-muted hover:text-white hover:bg-surface-light rounded-t-lg"
                            }`}
                            onClick={() => setActive(2)}
                        >
                            New Releases
                        </p>
                    </div>
                    <div className="mt-8 bg-surface-dim/20 rounded-2xl p-6 border border-surface-border">
                        <CourseSlider Courses={catalogPageData?.selectedCourses.course} />
                    </div>
                </div>  
        
                {/* section2 */}
                <div className=" mx-auto w-11/12 max-w-maxContent px-4 py-16">
                    <div className="text-3xl font-extrabold text-white mb-8">
                        Checkout <span className="text-brand-primary">{catalogPageData?.differentCourses.name}</span> Also
                    </div>
                    <div className="bg-surface-dim/20 rounded-2xl p-6 border border-surface-border">
                        <CourseSlider Courses={catalogPageData?.differentCourses.course}/>
                    </div>
                </div>
        
                {/* section3 */}
                <div className=" mx-auto w-11/12 max-w-maxContent px-4 py-16">
                    <div className="text-3xl font-extrabold text-white mb-10 flex items-center gap-3">
                        <span className="w-3 h-8 bg-brand-secondary rounded-sm"></span> 
                        Top Performing Curriculums
                    </div>
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                            {
                                catalogPageData?.mostSellingCourses?.length === 0 ? (<p className='text-xl text-text-muted italic'>No trending courses currently available.</p>) 
                                : (catalogPageData?.mostSellingCourses?.slice(0,4)
                                    .map((course, index) => (
                                        <div key={index} className="transform hover:-translate-y-2 transition-transform duration-300">
                                            <CourseCard course={course} Height={"h-[300px]"}/>
                                        </div>
                                )))
                            }
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            </>
                    )
                }
            </div>
          )
    }
}

export default Catalog
