/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Movie, Cinema, Showtime, Promotion, News, UserProfile } from "../types";

// 20 Movies Currently Playing (isUpcoming: false)
export const playingMovies: Movie[] = [
  {
    id: "m-1",
    title: "Mai",
    originalTitle: "Mai - A Film by Tran Thanh",
    genre: ["Tâm Lý", "Tình Cảm", "Gia Đình"],
    duration: 131,
    rating: "T18",
    score: 9.3,
    votes: 24500,
    releaseDate: "10/02/2026",
    isUpcoming: false,
    posterUrl: "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/SceS06pTMyQ",
    description: "Bộ phim xoay quanh cuộc đời của Mai, một người phụ nữ xấp xỉ 40 tuổi làm nghề mát-xa y học cổ truyền. Số phận đưa đẩy Mai gặp gỡ Dương, một chàng nhạc công trẻ lãng tử, luôn sống vô lo vô nghĩ. Chuyện tình ngọt ngào nhưng đẩy biến cố gõ cửa cuộc đời Mai, ép cô đối mặt với những định kiến xã hội sâu sắc cùng quá khứ đau thương.",
    director: "Trấn Thành",
    cast: ["Phương Anh Đào", "Tuấn Trần", "Hồng Đào", "Uyển Ân", "Khả Như"],
    language: "Tiếng Việt (phụ đề tiếng Anh)"
  },
  {
    id: "m-2",
    title: "Lật Mặt 7: Một Điều Ước",
    originalTitle: "Face Off 7: One Wish",
    genre: ["Gia Đình", "Tâm Lý", "Kịch Tính"],
    duration: 138,
    rating: "K",
    score: 9.5,
    votes: 31200,
    releaseDate: "26/04/2026",
    isUpcoming: false,
    posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/jZ_y9PqS6qU",
    description: "Câu chuyện cảm động về bà Hai, một người mẹ đơn thân tảo tần nuôi lớn 5 đứa con. Khi các con trưởng thành và có cuộc sống riêng tại nhiều nơi khác nhau, bà Hai không may gặp tai nạn gãy chân. Trách nhiệm chăm sóc mẹ già bị đùn đẩy giữa các người con thông qua các cuộc họp gia đình đầy căng thẳng, lột tả sâu sắc sự cô đơn của tuổi già trong xã hội hiện đại.",
    director: "Lý Hải",
    cast: ["Thanh Hiền", "Trương Minh Cường", "Đinh Y Nhung", "Quách Ngọc Tuyên", "Ammy Minh Khuê"],
    language: "Tiếng Việt"
  },
  {
    id: "m-3",
    title: "Dune: Hành Tinh Cát - Phần Hai",
    originalTitle: "Dune: Part Two",
    genre: ["Khoa Học Viễn Tưởng", "Hành Động", "Phiêu Lưu"],
    duration: 166,
    rating: "T16",
    score: 9.4,
    votes: 18900,
    releaseDate: "01/03/2026",
    isUpcoming: false,
    posterUrl: "https://images.unsplash.com/photo-1547483238-f400e65ccd56?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/Way9Dexny3w",
    description: "Paul Atreides hội quân cùng Chani và tộc người Fremen để chuẩn bị cho một cuộc chiến báo thù hoành tráng chống lại những kẻ đã hủy hoại gia tộc mình. Đối lập giữa tình yêu của cuộc đời và vận mệnh của vũ trụ, Paul dốc sức ngăn chặn viễn cảnh tương lai tăm tối mà chỉ mình anh có thể tiên tri.",
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Austin Butler", "Florence Pugh"],
    language: "Tiếng Anh - Phụ đề Tiếng Việt"
  },
  {
    id: "m-4",
    title: "Godzilla x Kong: Đế Chế Mới",
    originalTitle: "Godzilla x Kong: The New Empire",
    genre: ["Hành Động", "Khoa Học Viễn Tưởng", "Phiêu Lưu"],
    duration: 115,
    rating: "T13",
    score: 8.9,
    votes: 15400,
    releaseDate: "29/03/2026",
    isUpcoming: false,
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/lV1OOkyqgLk",
    description: "Vũ trụ quái vật tiếp tục bùng nổ khi hai vị vua Titan là Kong và Godzilla phải bắt tay nhau đối đầu với một mối đe dọa khổng lồ ẩn sâu bên dưới Trái Đất rỗng. Kẻ thù nguy hiểm lần này mong muốn hủy diệt cả nhân loại lẫn chính giống loài Titan tối cao.",
    director: "Adam Wingard",
    cast: ["Rebecca Hall", "Brian Tyree Henry", "Dan Stevens", "Kaylee Hottle"],
    language: "Tiếng Anh - Phụ đề Tiếng Việt"
  },
  {
    id: "m-5",
    title: "Inside Out 2: Các Mảnh Ghép Cảm Xúc 2",
    originalTitle: "Inside Out 2",
    genre: ["Hoạt Hình", "Hài Hước", "Gia Đình"],
    duration: 100,
    rating: "P",
    score: 9.6,
    votes: 27100,
    releaseDate: "14/06/2026",
    isUpcoming: false,
    posterUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1501183007986-d0d080b147f9?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/LEjhY15eCx0",
    description: "Bộ não của cô bé Riley khi bước vào tuổi dậy thì đột ngột đón chào những 'Vị khách không mời' mới tinh: Lo Âu (Anxiety), Ghen Tị (Envy), Sĩ Diện (Embarrassment) và Chán Nản (Ennui). Những cảm xúc cốt lõi cũ gồm Vui Vẻ, Buồn Bã, Giận Dữ, Sợ Hãi và Chán Ghét phải tìm cách hòa hợp để giúp cô bé vượt qua giai đoạn xáo trộn tâm lý học đường.",
    director: "Kelsey Mann",
    cast: ["Amy Poehler", "Maya Hawke", "Kensington Tallman", "Liza Lapira"],
    language: "Tiếng Anh - Phụ đề Tiếng Việt / Thuyết minh Tiếng Việt"
  },
  {
    id: "m-6",
    title: "Kẻ Trộm Mặt Trăng 4",
    originalTitle: "Despicable Me 4",
    genre: ["Hoạt Hình", "Hài Hước", "Gia Đình"],
    duration: 95,
    rating: "P",
    score: 8.8,
    votes: 12100,
    releaseDate: "05/07/2026",
    isUpcoming: false,
    posterUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1569074187119-c87815b476da?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/qQlr9-rF3_I",
    description: "Gru quay trở lại đối đầu với kẻ thù mới là Maxime Le Mal và cô bạn gái quyến rũ Valentina, buộc cả gia đình phải di chuyển đến nơi trú ẩn an toàn cực kỳ bí mật. Chuyến đi bỗng trở nên rộn ràng hơn bao giờ hết với sự xuất hiện của Gru Jr. nghịch ngợm cùng nhóm Siêu Minion đột biến.",
    director: "Chris Renaud",
    cast: ["Steve Carell", "Kristen Wiig", "Joey King", "Will Ferrell", "Sofia Vergara"],
    language: "Thuyết minh & Phụ đề Tiếng Việt"
  },
  {
    id: "m-7",
    title: "Kung Fu Panda 4",
    originalTitle: "Kung Fu Panda 4",
    genre: ["Hoạt Hình", "Hành Động", "Hài Hước"],
    duration: 94,
    rating: "P",
    score: 8.7,
    votes: 9800,
    releaseDate: "08/03/2026",
    isUpcoming: false,
    posterUrl: "https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1478720143022-385f704d3b73?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/fT7CBe_Zg7E",
    description: "Gấu trúc Po chuẩn bị thăng chức tiến tới trở thành Thủ Lĩnh Tâm Linh của Thung Lũng Bình Yên nhưng anh cần phải nhanh chóng đào tạo một truyền nhân Thần Long Hiệp Sĩ mới. Ngay lúc đó, nữ hoàng tắc kè Chameleon thâm độc xuất hiện, âm mưu triệu hồi tất cả các phản diện cũ từ cõi âm nhằm cướp đi gậy phép sức mạnh của Po.",
    director: "Mike Mitchell",
    cast: ["Jack Black", "Awkwafina", "Viola Davis", "Dustin Hoffman", "Ke Huy Quan"],
    language: "Thuyết minh & Phụ đề Tiếng Việt"
  },
  {
    id: "m-8",
    title: "Oppenheimer",
    originalTitle: "Oppenheimer",
    genre: ["Tiểu Sử", "Lịch Sử", "Chính Kịch"],
    duration: 180,
    rating: "T18",
    score: 9.7,
    votes: 14200,
    releaseDate: "11/08/2025",
    isUpcoming: false,
    posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/uYPbbksJxIg",
    description: "Bộ phim chấn động tái hiện cuộc đời đầy thăng trầm của nhà vật lý lý thuyết J. Robert Oppenheimer, người được mệnh danh là 'cha đẻ của bom nguyên tử'. Tác phẩm đi sâu vào Dự án Manhattan rực rỡ nhưng cũng vạch trần nỗi dằn vặt khôn nguôi về đạo đức nhân loại lẫn những phiên tòa phân trần chính trị cay nghiệt sau sự kiện Hiroshima.",
    director: "Christopher Nolan",
    cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr.", "Florence Pugh"],
    language: "Tiếng Anh - Phụ đề Tiếng Việt"
  },
  {
    id: "m-9",
    title: "Deadpool & Wolverine",
    originalTitle: "Deadpool & Wolverine",
    genre: ["Hành Động", "Hài Hước", "Quái Hiệp"],
    duration: 127,
    rating: "T18",
    score: 9.2,
    votes: 22400,
    releaseDate: "27/07/2026",
    isUpcoming: false,
    posterUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1559583985-c80d8ad9b29f?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/Idh8n5XuYIA",
    description: "Tổ chức Phương sai Thời gian (TVA) bất ngờ lôi Deadpool ra khỏi cuộc sống an lành yên ả của mình và bắt anh bắt tay hợp tác cùng một biến thể Wolverine đang tràn ngập chán nản. Cặp bài trùng 'chửi thề như hát' này gánh trên vai trọng trách giải cứu toàn bộ đa vũ trụ Marvel thoát khởi diệt vong.",
    director: "Shawn Levy",
    cast: ["Ryan Reynolds", "Hugh Jackman", "Emma Corrin", "Morena Baccarin", "Matthew Macfadyen"],
    language: "Tiếng Anh - Phụ đề Tiếng Việt"
  },
  {
    id: "m-10",
    title: "Cám",
    originalTitle: "Cam - The Bloody Fairy Tale",
    genre: ["Kinh Dị", "Thần Thoại", "Cổ Trang"],
    duration: 120,
    rating: "T18",
    score: 8.6,
    votes: 16700,
    releaseDate: "20/09/2026",
    isUpcoming: false,
    posterUrl: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/V6Wv_p40GjQ",
    description: "Dựa trên truyện cổ tích Tấm Cám quen thuộc nhưng mang màu sắc tâm linh tăm tối hơn rất nhiều. Bộ phim tập trung khai thác nhân vật Cám - một cô gái phải chịu chịu dị dạng khuôn mặt từ nhỏ và mối quan hệ chứa đựng những lời nguyền gia tộc thâm căn cố đế với hiến tế ác quỷ Bạch Hổ.",
    director: "Trần Hữu Tấn",
    cast: ["Lâm Thanh Mỹ", "Rima Thanh Vy", "Quốc Cường", "Thúy Diễm", "Hải Nam"],
    language: "Tiếng Việt"
  },
  {
    id: "m-11",
    title: "Ma Da",
    originalTitle: "Ma Da - The River Ghost",
    genre: ["Kinh Dị", "Tâm Linh", "Kịch Tính"],
    duration: 95,
    rating: "T16",
    score: 8.4,
    votes: 11100,
    releaseDate: "15/08/2026",
    isUpcoming: false,
    posterUrl: "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/jZf6T4E6YAg",
    description: "Bộ phim dựa trên truyền thuyết đô thị về 'Ma da bắt hồn' oan uổng tại vùng sông nước Tây Nam Bộ đầy hiểm trở. Bà Lệ, một người hành nghề vớt xác trên sông bị cuốn vào cuộc rượt đuổi tâm linh cứu vớt linh hồn con gái mình khi đứa bé lọt vào tầm ngắm oán khí của oan hồn.",
    director: "Nguyễn Hữu Hoàng",
    cast: ["Việt Hương", "Trung Dân", "Cẩm Ly", "Thành Lộc", "Dạ Chúc"],
    language: "Tiếng Việt"
  },
  {
    id: "m-12",
    title: "Thám Tử Lừng Danh Conan: Ngôi Sao 5 Cánh 1 Triệu Đô",
    originalTitle: "Detective Conan: The Million-dollar Pentagram",
    genre: ["Hoạt Hình", "Trinh Thám", "Hành Động"],
    duration: 110,
    rating: "T13",
    score: 9.4,
    votes: 17500,
    releaseDate: "02/08/2026",
    isUpcoming: false,
    posterUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/G6jWIs7mFpM",
    description: "Tại thành phố cảng Hakodate thơ mộng của Nhật Bản, siêu trộm Kaito Kid gửi thư cảnh báo nhắm vào một thanh kiếm Nhật cổ thuộc gia tộc tài phiệt. Cùng lúc đó, thi thể một tay buôn vũ khí khét tiếng bị sát hại với vết chém hình ngôi sao năm cánh đưa Conan, Heiji và Kid lâm vào một vụ phá án bí mật liên can tới kho báu xoay chuyển chiến tranh.",
    director: "Chika Nagaoka",
    cast: ["Minami Takayama", "Wakana Yamazaki", "Rikiya Koyama", "Kappei Yamaguchi"],
    language: "Tiếng Nhật - Phụ đề Tiếng Việt / lồng tiếng"
  },
  {
    id: "m-13",
    title: "Interstellar",
    originalTitle: "Interstellar",
    genre: ["Khoa Học Viễn Tưởng", "Chính Kịch", "Phiêu Lưu"],
    duration: 169,
    rating: "P",
    score: 9.8,
    votes: 38200,
    releaseDate: "07/11/2014",
    isUpcoming: false,
    posterUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/zSWdZVtXT7E",
    description: "Khi tương lai của loài người bên bờ vực tuyệt vọng bởi nạn đói và bão cát toàn cầu, một nhóm phi hành gia quả cảm thực hiện chuyến hành trình vĩ đại đi xuyên qua một hố sâu vũ trụ mới xuất hiện nhằm tìm kiếm một mái nhà mới cứu rỗi nhân loại nằm ngoài hệ Mặt Trời.",
    director: "Christopher Nolan",
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine"],
    language: "Tiếng Anh - Phụ đề Tiếng Việt"
  },
  {
    id: "m-14",
    title: "Spider-Man: Across the Spider-Verse",
    originalTitle: "Spider-Man: Across the Spider-Verse",
    genre: ["Hoạt Hình", "Hành Động", "Phiêu Lưu"],
    duration: 140,
    rating: "P",
    score: 9.6,
    votes: 21900,
    releaseDate: "02/06/2026",
    isUpcoming: false,
    posterUrl: "https://images.unsplash.com/photo-1608889175123-8ec330b86f84?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/g4H08z_t0vM",
    description: "Miles Morales vô tình chạm trán với Hội liên minh Nhện cai quản bởi Miguel O'Hara hoành tráng. Khi xảy ra bất đồng sâu sắc về cách xử lý định mệnh bi thương bảo vệ dòng thời gian, Miles nhận ra mình đang phải đối đầu chống lại gần như tất cả các phiên bản Người Nhện khác trong đa vũ trụ.",
    director: "Joaquim Dos Santos",
    cast: ["Shameik Moore", "Hailee Steinfeld", "Oscar Isaac", "Jake Johnson"],
    language: "Tiếng Anh - Phụ đề Tiếng Việt"
  },
  {
    id: "m-15",
    title: "John Wick: Chapter 4",
    originalTitle: "John Wick: Chapter 4",
    genre: ["Hành Động", "Kịch Tính", "Tội Phạm"],
    duration: 169,
    rating: "T18",
    score: 9.4,
    votes: 19400,
    releaseDate: "24/03/2026",
    isUpcoming: false,
    posterUrl: "https://images.unsplash.com/photo-1509347525353-53530c1e6005?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1533928298208-27ff66555d8d?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/yjyyXAyeC-Y",
    description: "Sát thủ huyền thoại John Wick tìm thấy con đường duy nhất để đánh bại Hội Đồng Tối Cao là thách đấu đối đầu trực diện tay đôi với Hầu Tước de Gramont hung tợn. Tuy nhiên, cái giá phải trả để đổi lấy sự tự do là cuộc chạm trán đẫm máu với những đồng đội cũ thân cận trên toàn cầu.",
    director: "Chad Stahelski",
    cast: ["Keanu Reeves", "Donnie Yen", "Bill Skarsgård", "Laurence Fishburne", "Hiroyuki Sanada"],
    language: "Tiếng Anh - Phụ đề Tiếng Việt"
  },
  {
    id: "m-16",
    title: "A Quiet Place: Day One",
    originalTitle: "A Quiet Place: Day One",
    genre: ["Kinh Dị", "Khoa Học Viễn Tưởng", "Kịch Tính"],
    duration: 100,
    rating: "T16",
    score: 8.5,
    votes: 8900,
    releaseDate: "28/06/2026",
    isUpcoming: false,
    posterUrl: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/YPY7J-flzE8",
    description: "Tìm hiểu nguồn gốc của ngày thế giới bắt đầu rơi vào sự im lặng tuyệt đối. Bộ phim theo chân Sam khi cô đang có chuyến dạo chơi New York thì thảm họa quái vật nhạy cảm âm thanh đổ bộ bất ngờ, cô phải tìm cách nương tựa người lạ trốn khỏi thành phố ồn ào bậc nhất thế giới.",
    director: "Michael Sarnoski",
    cast: ["Lupita Nyong'o", "Joseph Quinn", "Alex Wolff", "Djimon Hounsou"],
    language: "Tiếng Anh - Phụ đề Tiếng Việt"
  },
  {
    id: "m-17",
    title: "Furiosa: Chiến Binh Sa Mạc",
    originalTitle: "Furiosa: A Mad Max Saga",
    genre: ["Hành Động", "Khoa Học Viễn Tưởng", "Kịch Tính"],
    duration: 148,
    rating: "T18",
    score: 9.0,
    votes: 13400,
    releaseDate: "24/05/2026",
    isUpcoming: false,
    posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1547483238-f400e65ccd56?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/XJMuhwVlca4",
    description: "Khi thế giới sụp đổ hoang vu tàn tạ, cô gái trẻ Furiosa bị cướp khởi Vùng đất xanh tươi từ tay đám tay sai hầm hố của Lãnh chúa Dementus. Đi qua vùng đất hoang sa mạc rực lửa, Furiosa rèn luyện tính kiên định và ý chí thép để tìm đường trở về nhà bất chấp bạo lực điên khùng xung quanh.",
    director: "George Miller",
    cast: ["Anya Taylor-Joy", "Chris Hemsworth", "Tom Burke", "Alyla Browne"],
    language: "Tiếng Anh - Phụ đề Tiếng Việt"
  },
  {
    id: "m-18",
    title: "Quỷ Cẩu",
    originalTitle: "The Dog",
    genre: ["Kinh Dị", "Tâm Tình", "Gia Đình"],
    duration: 99,
    rating: "T18",
    score: 8.3,
    votes: 12500,
    releaseDate: "29/12/2025",
    isUpcoming: false,
    posterUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/J7XfN8L08jQ",
    description: "Khai thác đề tài nghiệp báo dân gian truyền miệng xoay quanh nghề mổ chó lậu của gia đình nhà Nam. Khi bố Nam đột tử qua đời đầy bí ẩn dối trá, những sự kiện dị thường rùng rợn ập đến ngôi nhà dâm dục oán hận, lột tả dã tâm tột cùng thối nát che chở đằng sau lòng tham con người.",
    director: "Lưu Thành Luân",
    cast: ["Quang Tuấn", "NSND Kim Xuân", "Vân Dung", "Huỳnh Kiến An", "Nam Thư"],
    language: "Tiếng Việt"
  },
  {
    id: "m-19",
    title: "Doraemon: Bản Giao Hưởng Địa Cầu",
    originalTitle: "Doraemon the Movie: Nobita's Earth Symphony",
    genre: ["Hoạt Hình", "Phiêu Lưu", "Âm Nhạc"],
    duration: 115,
    rating: "P",
    score: 9.2,
    votes: 11300,
    releaseDate: "24/05/2026",
    isUpcoming: false,
    posterUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/l592QunO3Zg",
    description: "Nobita luyện tập sáo dở tệ bỗng vô tình kích hoạt năng lượng âm nhạc kỳ lạ kêu gọi một cô bé ngoài hành tinh mang tên Micca ghé thăm. Cùng Doraemon, các bạn trẻ dấn thân vào hành trình vỹ đại bảo vệ lâu đài âm nhạc Fare và giúp địa cầu phục hồi năng lượng nhạc cụ quý giá thoát chết trước quái thú đen tối vô thanh.",
    director: "Kazuaki Imai",
    cast: ["Wasabi Mizuta", "Megumi Ohara", "Yumi Kakazu", "Subaru Kimura"],
    language: "Lồng tiếng & Phụ đề Tiếng Việt"
  },
  {
    id: "m-20",
    title: "Nhà Bà Nữ",
    originalTitle: "The House of No Man",
    genre: ["Gia Đình", "Tâm Lý", "Hài Hước"],
    duration: 102,
    rating: "T16",
    score: 9.1,
    votes: 28900,
    releaseDate: "22/01/2025",
    isUpcoming: false,
    posterUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/tM0OQ6q8T2U",
    description: "Bộ phim đi sâu vào những xung đột đầy chua xót giữa các thế hệ trong gia đình bà Nữ - người phụ nữ bán bánh canh cua độc đoán gia trưởng cai quản ba thế hệ con cái dưới một mái nhà. Mối mâu thuẫn đỉnh điểm nổ ra khi cô con gái út quyết định bất chấp nổi loạn theo đuổi người yêu.",
    director: "Trấn Thành",
    cast: ["Trấn Thành", "Lê Giang", "Uyển Ân", "Song Luân", "NSND Ngọc Giàu"],
    language: "Tiếng Việt"
  }
];

// 10 Upcoming Movies (isUpcoming: true)
export const upcomingMovies: Movie[] = [
  {
    id: "m-21",
    title: "Avatar 3: Lửa Và Tro",
    originalTitle: "Avatar: Fire and Ash",
    genre: ["Khoa Học Viễn Tưởng", "Hành Động", "Phiêu Lưu"],
    duration: 180,
    rating: "T13",
    score: 0,
    votes: 0,
    releaseDate: "18/12/2026",
    isUpcoming: true,
    posterUrl: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/Y0fL6v2WAsU", // General Avatar/Teaser placeholder
    description: "Phần phim thứ 3 đưa cuộc phiêu lưu của tộc người Na'vi tiến tới một khu vực địa chất khắc nghiệt hoàn toàn mới. Tại đây xuất hiện thị tộc 'Người Tro' (Ash People) dũng mãnh hung tợn tôn thờ ngọn lửa, đại diện cho những mặt tăm tối thù hận sâu kín hơn của hành tinh Pandora hoành tráng.",
    director: "James Cameron",
    cast: ["Sam Worthington", "Zoe Saldana", "Sigourney Weaver", "Oona Chaplin"],
    language: "Tiếng Anh - Phụ đề Tiếng Việt",
    countdownEnd: "2026-12-18T00:00:00"
  },
  {
    id: "m-22",
    title: "Kỷ Băng Hà 6",
    originalTitle: "Ice Age 6",
    genre: ["Hoạt Hình", "Hài Hước", "Gia Đình"],
    duration: 98,
    rating: "P",
    score: 0,
    votes: 0,
    releaseDate: "15/07/2026",
    isUpcoming: true,
    posterUrl: "https://images.unsplash.com/photo-1542840410-3092f6de946a?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/hK2iN2U-tH4",
    description: "Manny, Sid, Diego và biệt đội kỷ băng hà vui nhộn tái ngộ trong cuộc hành trình phiêu lưu vượt địa hình mới cực đoan khi thế giới tiền sử xảy ra biến đổi khí hậu khắc nghiệt, hứa hẹn đem đến những tràng cười sảng khoái tưng bừng.",
    director: "John C. Donkin",
    cast: ["Ray Romano", "John Leguizamo", "Denis Leary", "Simon Pegg"],
    language: "Thuyết minh & Phụ đề Tiếng Việt",
    countdownEnd: "2026-07-15T00:00:00"
  },
  {
    id: "m-23",
    title: "Superman (Chúa Tể Di Sản)",
    originalTitle: "Superman: Legacy",
    genre: ["Hành Động", "Khoa Học Viễn Tưởng"],
    duration: 142,
    rating: "T13",
    score: 0,
    votes: 0,
    releaseDate: "10/08/2026",
    isUpcoming: true,
    posterUrl: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/G6jWIs7mFpM",
    description: "Câu chuyện khởi nguồn của vũ trụ DC mới (DCU) khai thác chặng đường non trẻ của Clark Kent khi anh tìm cách cân bằng nguồn gốc di sản Kryptonian của mình với cuộc sống lớn lên thánh thiện tại trang trại dưới gia đình loài người vùng Kansas.",
    director: "James Gunn",
    cast: ["David Corenswet", "Rachel Brosnahan", "Isabela Merced", "Nicholas Hoult"],
    language: "Tiếng Anh - Phụ đề Tiếng Việt",
    countdownEnd: "2026-08-10T00:00:00"
  },
  {
    id: "m-24",
    title: "Shrek 5",
    originalTitle: "Shrek 5: Forever Green",
    genre: ["Hoạt Hình", "Hài Hước", "Thần Thoại"],
    duration: 105,
    rating: "P",
    score: 0,
    votes: 0,
    releaseDate: "20/09/2026",
    isUpcoming: true,
    posterUrl: "https://images.unsplash.com/photo-1601987177651-8edfe6c20009?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1500627869374-13cd993b1115?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/Idh8n5XuYIA",
    description: "Gã chằn tinh màu xanh Shrek nổi tiếng quay trở lại vương quốc xa thật xa để bảo vệ đàn con khốn khổ nghịch ngợm khỏi một nấc thang lật đổ hoàng gia bất đắc dĩ từ ông vua hài hước độc đáo.",
    director: "Walt Dohrn",
    cast: ["Mike Myers", "Eddie Murphy", "Cameron Diaz", "Antonio Banderas"],
    language: "Thuyết minh & Phụ đề Tiếng Việt",
    countdownEnd: "2026-09-20T00:00:00"
  },
  {
    id: "m-25",
    title: "Toy Story 5: Đồ Chơi Nổi Loạn",
    originalTitle: "Toy Story 5",
    genre: ["Hoạt Hình", "Gia Đình", "Phiêu Lưu"],
    duration: 102,
    rating: "P",
    score: 0,
    votes: 0,
    releaseDate: "12/10/2026",
    isUpcoming: true,
    posterUrl: "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1559251606-c623743a6d76?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/Idh8n5XuYIA",
    description: "Lần này, Woody, Buzz Lightyear và biệt đội đồ chơi trung thành quen thuộc phải trực diện đối đầu với mối đe dọa thời đại công nghệ số mới: Sự thu hút ám ảnh kỳ lạ của trẻ em đối với máy tính bảng, điện thoại di động làm lãng quên đi những món đồ chơi thực tế.",
    director: "Andrew Stanton",
    cast: ["Tom Hanks", "Tim Allen", "Joan Cusack", "Tony Hale"],
    language: "Thuyết minh & Phụ đề Tiếng Việt",
    countdownEnd: "2026-10-12T00:00:00"
  },
  {
    id: "m-26",
    title: "Avengers: Doomsday (Kỷ Nguyên Doom)",
    originalTitle: "Avengers: Doomsday",
    genre: ["Hành Động", "Khoa Học Viễn Tưởng", "Phiêu Lưu"],
    duration: 155,
    rating: "T13",
    score: 0,
    votes: 0,
    releaseDate: "01/11/2026",
    isUpcoming: true,
    posterUrl: "https://images.unsplash.com/photo-1496062772023-95b602ba064b?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/Idh8n5XuYIA",
    description: "Sự xuất hiện chấn động của Victor von Doom khét tiếng trong đa vũ trụ Marvel kích hoạt cuộc nội chiến khẩn cấp. Nhóm Avengers tàn tạ thế hệ mới phải ngay tức khắc tề tựu nhằm bảo vệ thế giới của họ tránh khỏi thảm họa xé rách màng ngăn thời gian vô nghĩa.",
    director: "Anthony Russo, Joe Russo",
    cast: ["Robert Downey Jr.", "Pedro Pascal", "Benedict Cumberbatch", "Florence Pugh"],
    language: "Tiếng Anh - Phụ đề Tiếng Việt",
    countdownEnd: "2026-11-01T00:00:00"
  },
  {
    id: "m-27",
    title: "Đất Rừng Phương Nam: Phần 2",
    originalTitle: "Song of the South: Part II",
    genre: ["Lịch Sử", "Chính Kịch", "Hành Động"],
    duration: 135,
    rating: "K",
    score: 0,
    votes: 0,
    releaseDate: "24/12/2026",
    isUpcoming: true,
    posterUrl: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/Idh8n5XuYIA",
    description: "Tiếp tục theo du hành chân trời sông nước của bé An cùng Cò và những người dân nghĩa khí đất Nam Kỳ kháng Pháp hùng vĩ. Phần hai mở rộng thêm câu chuyện tình yêu nước lớn lao lẫn tinh thần hào sảng bất khuất rạng ngời bờ tre đất Việt chân chất.",
    director: "Nguyễn Quang Dũng",
    cast: ["Hạo Khang", "Bình An", "Tuấn Trần", "Trấn Thành", "Tiến Luật"],
    language: "Tiếng Việt",
    countdownEnd: "2026-12-24T00:00:00"
  },
  {
    id: "m-28",
    title: "Spider-Man 4: Trở Về Nhờ Đa Vũ Trụ",
    originalTitle: "Spider-Man 4",
    genre: ["Hành Động", "Khoa Học Viễn Tưởng", "Phiêu Lưu"],
    duration: 138,
    rating: "T13",
    score: 0,
    votes: 0,
    releaseDate: "05/11/2026",
    isUpcoming: true,
    posterUrl: "https://images.unsplash.com/photo-1608889175123-8ec330b86f84?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/Idh8n5XuYIA",
    description: "Peter Parker giờ đây hoàn toàn đơn độc sau sự kiện phép thuật tẩy xóa ký ức của Doctor Strange. Cậu vừa làm việc mưu sinh đời thường khu Manhattan vừa gồng mình làm người nhện bảo an khu xóm cho đến khi một đối thủ nguy hiểm nổ súng ép cậu hé lộ thân phận.",
    director: "Destin Daniel Cretton",
    cast: ["Tom Holland", "Zendaya", "Sydney Sweeney", "Jacob Batalon"],
    language: "Tiếng Anh - Phụ đề Tiếng Việt",
    countdownEnd: "2026-11-05T00:00:00"
  },
  {
    id: "m-29",
    title: "Minecraft Movie: Thế Giới Khối Vuông",
    originalTitle: "A Minecraft Movie",
    genre: ["Phiêu Lưu", "Kỳ Ảo", "Hài Hước"],
    duration: 100,
    rating: "P",
    score: 0,
    votes: 0,
    releaseDate: "15/08/2026",
    isUpcoming: true,
    posterUrl: "https://images.unsplash.com/photo-1601987177651-8edfe6c20009?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/Idh8n5XuYIA",
    description: "Tác phẩm live-action chuyển đổi từ tựa game huyền thoại thế giới mở Minecraft. Bốn người lập dị lạc lòng bỗng dưng bị hút thẳng vào cánh cổng tới Overworld - một vùng cực đoan rực rỡ kỳ quái cấu thành toàn từ các khối vuông đất cát.",
    director: "Jared Hess",
    cast: ["Jason Momoa", "Jack Black", "Danielle Brooks", "Sebastian Eugene Hansen"],
    language: "Thuyết minh & Phụ đề Tiếng Việt",
    countdownEnd: "2026-08-15T00:00:00"
  },
  {
    id: "m-30",
    title: "The Batman: Part II",
    originalTitle: "The Batman: Part II",
    genre: ["Hành Động", "Trinh Thám", "Hình Sự"],
    duration: 160,
    rating: "T18",
    score: 0,
    votes: 0,
    releaseDate: "03/10/2026",
    isUpcoming: true,
    posterUrl: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1509347525353-53530c1e6005?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/Idh8n5XuYIA",
    description: "Hiệp sĩ bóng đêm Bruce Wayne lấn sâu hơn vào bóng tối của giới tội phạm ngầm Gotham dột nát hoành trành sau thảm họa ngập nước cứu nguy. Kẻ thù của anh giờ mở rộng ra các băng nhóm hùng hữu và sự can tặc của hội kín quý tộc Court of Owls khét tiếng.",
    director: "Matt Reeves",
    cast: ["Robert Pattinson", "Zoë Kravitz", "Andy Serkis", "Jeffrey Wright"],
    language: "Tiếng Anh - Phụ đề Tiếng Việt",
    countdownEnd: "2026-10-03T00:00:00"
  }
];

export const allMovies: Movie[] = [...playingMovies, ...upcomingMovies];

// 5 Cinemas
export const cinemas: Cinema[] = [
  {
    id: "c-1",
    name: "X Cinema Hoàn Kiếm",
    address: "Tầng 5, Tràng Tiền Plaza, 24 Hai Bà Trưng, Quận Hoàn Kiếm, Hà Nội",
    phone: "024.3934.3333",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=600",
    mapEmbed: "Hoàn Kiếm Cinema"
  },
  {
    id: "c-2",
    name: "X Cinema Cầu Giấy",
    address: "Tòa nhà Discovery Complex, 302 Cầu Giấy, Quận Cầu Giấy, Hà Nội",
    phone: "024.6293.5555",
    imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=600",
    mapEmbed: "Cầu Giấy Cinema"
  },
  {
    id: "c-3",
    name: "X Cinema Thanh Xuân",
    address: "X Royal City, B2-R3-10, 72A Nguyễn Trãi, Quận Thanh Xuân, Hà Nội",
    phone: "024.6664.8888",
    imageUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=600",
    mapEmbed: "Thanh Xuân Cinema"
  },
  {
    id: "c-4",
    name: "X Cinema Hà Đông",
    address: "Tầng 4, Aeon Mall Hà Đông, Phường Dương Nội, Quận Hà Đông, Hà Nội",
    phone: "024.2238.9999",
    imageUrl: "https://images.unsplash.com/photo-1547483238-f400e65ccd56?auto=format&fit=crop&q=80&w=600",
    mapEmbed: "Hà Đông Cinema"
  },
  {
    id: "c-5",
    name: "X Cinema Long Biên",
    address: "Tầng 3, Mipec Long Biên, Số 2 Long Biên II, Quận Long Biên, Hà Nội",
    phone: "024.3322.1111",
    imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=600",
    mapEmbed: "Long Biên Cinema"
  }
];

// Generate 50 Showtimes (dd/mm/yyyy structure. Let's make bookings today and tomorrow!)
export const generateShowtimes = (): Showtime[] => {
  const list: Showtime[] = [];
  const times = ["09:00", "11:30", "14:00", "16:30", "19:00", "21:30"];
  const formats: ("2D Phụ đề" | "3D Phụ đề" | "IMAX 3D" | "2D lồng tiếng")[] = [
    "2D Phụ đề",
    "2D lồng tiếng",
    "IMAX 3D"
  ];

  // We want showtimes for playing movies
  // Today's date and Tomorrow's date
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const formatD = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const d1 = formatD(today);
  const d2 = formatD(tomorrow);
  const dates = [d1, d2];

  let idCounter = 1;

  // Let's seed showtimes systematically so that EVERY playing movie has at least 1-2 showtimes,
  // spreading them across various cinemas and times.
  cinemas.forEach((cinema, cIdx) => {
    playingMovies.forEach((movie, mIdx) => {
      // Not every movie in every cinema to make it organic, but ensure total is >= 50.
      if ((mIdx + cIdx) % 2 === 0) {
        dates.forEach((date, dIdx) => {
          // Select 2 times for each movie in this cinema on this date
          const time1 = times[(mIdx + cIdx + dIdx) % times.length];
          const time2 = times[(mIdx + cIdx + dIdx + 3) % times.length];
          const format = formats[(mIdx + cIdx) % formats.length];

          list.push({
            id: `st-${idCounter++}`,
            movieId: movie.id,
            cinemaId: cinema.id,
            date: date,
            time: time1,
            room: `Rạp ${((mIdx + cIdx) % 4) + 1}`,
            format: format,
            priceStandard: 85000,
            priceVIP: 110000,
            priceDouble: 240000
          });

          if (list.length < 55) {
            list.push({
              id: `st-${idCounter++}`,
              movieId: movie.id,
              cinemaId: cinema.id,
              date: date,
              time: time2,
              room: `Rạp ${((mIdx + cIdx) % 4) + 2}`,
              format: format,
              priceStandard: 85000,
              priceVIP: 110000,
              priceDouble: 240000
            });
          }
        });
      }
    });
  });

  return list.slice(0, 52); // Exactly >= 50 showtimes
};

export const showtimes: Showtime[] = generateShowtimes();

// 10 Promotions (Khuyến mãi)
export const promotions: Promotion[] = [
  {
    id: "p-1",
    title: "ỨNG DỤNG X CINEMA - MUA 2 TẶNG 1",
    description: "Khách hàng thân thiết tải ứng dụng X Cinema và đặt vé thành công sẽ được tặng miễn phí 01 Bắp ngọt size L cho hóa đơn từ 2 vé trở lên.",
    code: "TCDBAP",
    discountPercent: 15,
    validity: "Đến hết 31/12/2026",
    imageUrl: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "p-2",
    title: "SIÊU THỨ 4 VUI VẺ - ĐỒNG GIÁ 60K",
    description: "Toàn bộ vé xem phim 2D trong ngày Thứ Tư vui vẻ hàng tuần đồng giá 60.000 VNĐ áp dụng cho tất cả khung giờ và các nhóm khách hàng.",
    code: "THU4VUI",
    discountPercent: 30,
    validity: "Áp dụng Thứ Tư hàng tuần",
    imageUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "p-3",
    title: "COMBO HỌC SINH SINH VIÊN - GIẢM 20K",
    description: "Chỉ cần xuất trình thẻ Học sinh - Sinh viên khi mua Combo bắp nước trực tiếp tại quầy hoặc ứng dụng để được giảm ngay 20.000 VNĐ tiền mặt.",
    code: "COSMO20",
    discountPercent: 10,
    validity: "Đến hết 31/12/2026",
    imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "p-4",
    title: "ƯU ĐÃI THÀNH VIÊN MỚI - 50% VẺ",
    description: "Đăng ký thành viên mới của hệ thống rạp phim X Cinema để nhận ngay voucher giảm giá 50% cho tấm vé đầu tiên đặt online thành công.",
    code: "WELCOME50",
    discountPercent: 50,
    validity: "Từ nay đến 31/10/2026",
    imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "p-5",
    title: "ĐẶT VÉ MOMO - GIẢM ĐẾN 50K",
    description: "Liên kết và thanh toán hóa đơn mua vé phim X Cinema bằng Ví MoMo để nhận ngay voucher ngẫu nhiên mệnh giá từ 10.000 VNĐ đến 50.000 VNĐ.",
    code: "MOMOTCD",
    discountPercent: 20,
    validity: "Đến hết 31/08/2026",
    imageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "p-6",
    title: "VNPAY QUÉT MÃ - HOÀN TIỀN 10%",
    description: "Nhập mã khuyến mãi khi sử dụng ứng dụng ngân hàng quét mã QR VNPAY tại rạp hoặc cổng thanh toán để được hoàn tiền trực tiếp 10% giá trị hóa đơn.",
    code: "VNPAYTC",
    discountPercent: 10,
    validity: "Hàng ngày đến ngày 31/12/2026",
    imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "p-7",
    title: "GIA ĐÌNH CUỐI TUẦN - GHẾ ĐÔI GIẢM 15%",
    description: "Chọn mua ghế đôi (Sweetbox) trải nghiệm không gian chiếu riêng tư cùng người thân dịp cuối tuần sẽ được khuyến mãi chiết khấu ngay 15% tổng bill.",
    code: "SWEETBOX",
    discountPercent: 15,
    validity: "Áp dụng Thứ 7 và Chủ Nhật",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "p-8",
    title: "TÍCH ĐIỂM X2 - SĂN VÉ HOÀN TIỀN",
    description: "Thành viên kim cương và vàng được nhân đôi điểm tích lũy thành viên khi xem bất cứ bộ phim bom tấn nước ngoài nào chiếu trước 12:00 trưa hàng ngày.",
    code: "X2DIEM",
    discountPercent: 0,
    validity: "Vô thời hạn",
    imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "p-9",
    title: "ƯU ĐÃI TRUNG THU - BÁNH VẦNG TRĂNG",
    description: "Quý khách mua combo Trung Thu đặc biệt sẽ được tặng ngay một chiếc bánh nướng mini hương sen dừa thơm phức ngào ngạt hương vị sum vầy.",
    code: "TRUNGTHU",
    discountPercent: 12,
    validity: "Từ 01/09/2026 đến hết 15/09/2026",
    imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "p-10",
    title: "MINI GAMES: VÒNG QUAY MAY MẮN",
    description: "Tải app X Cinema tham gia tương tác điểm danh nhận lượt quay miễn phí hốt ngay hàng ngàn chiếc vé xem phim 0đ độc quyền mỗi ngày.",
    code: "LUCKYSPIN",
    discountPercent: 25,
    validity: "Đến hết 15/08/2026",
    imageUrl: "https://images.unsplash.com/photo-1501183007986-d0d080b147f9?auto=format&fit=crop&q=80&w=400"
  }
];

// 10 News items (Tin tức)
export const news: News[] = [
  {
    id: "n-1",
    title: "Lý Hải phá kỷ lục bán vé với phim mới 'Lật Mặt 7'",
    summary: "Thương hiệu phim gia đình đặc trưng 'Lật Mặt 7: Một Điều Ước' vượt qua cột mốc hàng triệu lượt xem chỉ sau chưa đầy một tuần phát hành chính thức tại Việt Nam.",
    content: "Mặc cho thời tiết nắng nóng kỷ lục và sự cạnh tranh gay gắt từ các bom tấn Hollywood khác, bộ phim tâm lý tình cảm gia đình của nam đạo diễn Lý Hải đã chứng minh sức hút mãnh liệt của tình mẫu tử Việt Nam. Sở hữu hơn 4000 suất chiếu mỗi ngày trên cả nước, bộ phim thu hẹp khoảng cách thế hệ và mang hàng ngàn gia đình ba thế hệ đến rạp nước mắt rưng rưng vì xúc động.",
    date: "28/04/2026",
    category: "Điện Ảnh",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=600",
    views: 12400
  },
  {
    id: "n-2",
    title: "Bom tấn 'Dune: Part Two' thiết lập đỉnh cao kỹ xảo điện ảnh mới",
    summary: "Giới phê bình nghệ thuật hết lời ca ngợi đạo diễn Denis Villeneuve khi tái hiện hoàn hảo hành tinh cát Arrakis tráng lệ và khốc liệt trên màn ảnh rộng IMAX.",
    content: "Được mệnh danh là tượng đài điện ảnh khoa học viễn tưởng của thập kỷ, Dune 2 đã làm nổ tung toàn bộ phòng vé thế giới bằng âm hưởng trống dồn rạo rực của Hans Zimmer kết hợp cùng những khung hình sa mạc màu cam tuyệt tác. Trải nghiệm xem Dune 2 bắt buộc phải là màn chiếu khổng lồ chất lượng cao để mắt nhìn bao quát được toàn dải sâu của hố giun khổng lồ.",
    date: "05/03/2026",
    category: "Điện Ảnh",
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=600",
    views: 8900
  },
  {
    id: "n-3",
    title: "X Cinema tưng bừng khai trương chuỗi rạp IMAX tân tiến",
    summary: "Hệ thống rạp chiếu bóng cao cấp X Cinema tự hào công bố khai trương chuỗi màn hình IMAX 3D định dạng tối tân bậc nhất tại cơ sở Cầu Giấy và Long Biên.",
    content: "Luôn đặt ưu tiên trải nghiệm điện ảnh chân thực của khách hàng lên hàng đầu, X Cinema chính thức liên kết tập đoàn IMAX Canada mang về phòng chiếu với thiết kế độ dốc lý tưởng, âm thanh vòm chấn rung từng thớ cơ và những hình chiếu rực rỡ có độ tương phản tuyệt vời đối chọi mọi dải sáng tối.",
    date: "12/05/2026",
    category: "Sự Kiện",
    imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=600",
    views: 14500
  },
  {
    id: "n-4",
    title: "Hậu trường kỳ công đằng sau tạo hình sinh động các hạt cảm xúc mới trong Inside Out 2",
    summary: "Hãng phim Pixar hé lộ vô vàn thử thách lý thú khi phác họa những biểu cảm phức tạp của các cảm xúc tuổi dậy thì tinh nghịch của cô bé Riley.",
    content: "Làm thế nào để vẽ nên sự Lo Âu (Anxiety) một cách hài hước nhưng thấu cảm sâu? Các họa sĩ tài năng từ Pixar đã dành hàng tháng trời nghiên cứu tâm sinh lý trẻ vị thành niên và thảo luận cùng các bác sĩ thần kinh học để chọn lựa gam màu cam đất có khả năng rung liên hồi làm đại diện xuất sắc cho nhân vật thu hút hàng triệu sự đồng cảm này.",
    date: "16/06/2026",
    category: "Hậu Trường",
    imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=600",
    views: 9340
  },
  {
    id: "n-5",
    title: "Ngành phim Việt nửa đầu năm đầy khởi sắc với doanh thu nghìn tỷ",
    summary: "Hiệp hội phát hành phim thống kê mức tăng trưởng kỷ lục của điện ảnh nước nhà với sự thống trị từ các nhà phát triển tài năng nội địa giàu cảm xúc.",
    content: "Liên tiếp các kỷ lục doanh thu phòng vé bị xô đổ bởi phim Tết 'Mai' và tiếp sau đó là tác phẩm gia đình đầy ý nghĩa 'Lật Mặt 7'. Khán giả nước nhà ngày càng tin tưởng và chuộng trải nghiệm ngồi trực tiếp mua vé xem những thước phim văn hóa ẩm thực, phong tục tập quán mộc mạc của quê hương.",
    date: "10/06/2026",
    category: "Điện Ảnh",
    imageUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=600",
    views: 11200
  },
  {
    id: "n-6",
    title: "Những điều thú vị bạn chưa biết về quái vật trong phim kinh dị Ma Da",
    summary: "Hành trình thám hiểm sông nước Cà Mau đoàn làm phim vượt qua nhiều tập tục thờ cúng và truyền thuyết bí ẩn về thủy quái giữ hương sông nước.",
    content: "Đạo diễn Nguyễn Hữu Hoàng chia sẻ đoàn phim phải dầm mưa dãi nắng ròng rã dở sống dở chết dưới làn nước sình lầy đục ngầu miền Tây suốt gần một tháng trời. Tạo hình thợ lặn tàn rữa của Ma Da được chế tạo tỉ mỉ từ đất sét thiên nhiên và lớp thạch dẻo sinh học bền vững không gây ô nhiễm môi trường sinh thái sông.",
    date: "18/08/2026",
    category: "Hậu Trường",
    imageUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=600",
    views: 7120
  },
  {
    id: "n-7",
    title: "Cơ hội săn vé X Cinema miễn phí trọn đời cùng chương trình Vòng Quay Thần Kỳ",
    summary: "Mừng sinh nhật 3 tuổi, X Cinema chơi lớn tri ân toàn bộ người dùng bằng chuỗi giải thưởng giá trị cực đại có cơ hội nhận một năm xem phim thả ga.",
    content: "Chỉ cần đăng nhập tích cực vào hệ thống tài khoản website X Cinema hàng tuần, tham dự trả lời các câu đố điện ảnh đố vui có thưởng bắp ngọt, người chơi dễ dàng rinh quà là những tấm vé máy chiếu bom tấn sớm tuần đầu và những ly bắp kỷ niệm in họa tiết các phi hành gia sành điệu.",
    date: "01/06/2026",
    category: "Khuyến Mãi",
    imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600",
    views: 18900
  },
  {
    id: "n-8",
    title: "Cháy vé ngày đầu công chiếu cho phim hoạt hình Doraemon 2026 mới nhất",
    summary: "Những rạp phim lớn tại Hà Nội chứng kiến cảnh xếp hàng nhộn nhịp của hàng ngàn cha mẹ đưa con nhỏ đến thưởng thức 'Bản Giao Hưởng Địa Cầu'.",
    content: "Sức hút của chú mèo máy thông minh Doraemon cùng những món bảo bối diệu kỳ không hề giảm nhiệt qua nhiều thập kỷ. Với đề tài bảo vệ âm nhạc và trái đất đầy ý nghĩa nhân văn, bộ phim thu hút cả người lớn thế hệ 8X, 9X tìm về kỷ niệm tuổi thơ tươi mát bên những trang giấy truyện tranh.",
    date: "25/05/2026",
    category: "Điện Ảnh",
    imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=600",
    views: 10400
  },
  {
    id: "n-9",
    title: "Avatar 3 hứa hẹn thiết lập một chuẩn mực hoạt ảnh đỉnh cao mộc mạc đột phá",
    summary: "James Cameron tiết lộ phần phim mới đã hoàn thành 95% khâu hậu kỳ hình ảnh 3D chân thực, sẵn sàng càn quét phòng vé cuối năm nay.",
    content: "Được xây dựng trên nền tảng tiến trình đồ họa học máy kết hợp cùng hệ thống máy quay dưới nước áp bọc quang năng hiện đại bậc nhất, Avatar 3: Lửa và Tro không chỉ đem lại cuộc xung đột vũ trang kịch tính mà còn lột tả sinh động sự mờ ảo mộc mạc của làn khói tro tàn bay nhảy giữa kẽ tay các chiến binh da xanh rừng xanh thẳm.",
    date: "09/06/2026",
    category: "Điện Ảnh",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600",
    views: 15100
  },
  {
    id: "n-10",
    title: "Chương trình điện ảnh xanh: Đổi vỏ hộp bắp nhận ly thủy tinh độc đáo tại X Cinema",
    summary: "Cam kết hành động giảm rác thải nhựa có hại bảo vệ tương lai xanh tươi, X Cinema phát động chiến dịch ý nghĩa hướng tới khán giả trẻ có ý thức.",
    content: "Khán giả mang theo xô bắp cũ làm từ bã mía sinh học hoặc sưu tập đủ 3 hóa đơn điện tử không ghi giấy in nhiệt để tiến tới quầy dịch vụ quy đổi lập tức một chiếc cốc thủy tinh mờ in logo X Cinema mang phong cách mộc mạc rực rỡ, nhằm lan tỏa lối sống bền bỉ thân thiện từ những hành động nhỏ.",
    date: "02/06/2026",
    category: "Sự Kiện",
    imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=600",
    views: 6500
  }
];

// Initial default user profile (stored in LocalStorage on startup if not existing)
export const defaultUserProfile: UserProfile = {
  name: "Nguyễn Anh Đức",
  email: "nguyenanhducdemmer@gmail.com",
  phone: "0987.654.321",
  avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=DucNguyen",
  membershipId: "X-MEM-55809",
  points: 1250,
  favoriteMovies: ["m-1", "m-3", "m-5"] // movie ids
};
