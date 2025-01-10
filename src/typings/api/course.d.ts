declare namespace Api {
  namespace Course {
    /** 课程基础类型 */
    type Course = Api.Common.CommonRecord<{
      /** 课程ID */
      id: number;
      /** 课程标题 */
      title: string;
      /** 课程封面 */
      pic: string;
      /** 课程描述 */
      desc: string;
      /** 富文本内容 */
      context: string;
      /** 访问次数 */
      visitCount: number;
      /** 排序 */
      sort: number;
    }>;

    /** 课程列表查询返回类型 */
    type CourseList = Api.Common.PaginatingQueryRecord<Course>;

    /** 课程搜索参数类型 */
    type CourseSearchParams = CommonType.RecordNullable<
      Pick<Course, 'title'> & Api.Common.CommonSearchParams
    >;

    /** 新增课程参数类型 */
    interface CourseAdd {
      /** 课程标题 */
      title: string;
      /** 课程封面 */
      pic: string;
      /** 课程描述 */
      desc: string;
      /** 富文本内容 */
      context: string;
      /** 排序 */
      sort: number;
    }

    /** 编辑课程参数类型 */
    interface CourseEdit extends CourseAdd {
      /** 课程ID */
      id: number;
    }
  }
}
