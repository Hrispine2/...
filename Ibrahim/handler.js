const embarrassing_questions_truth = ``.split(','),
truth_girl_questions = ``.split(','),
tord_friend_questions = ``.split(','),
truth_guy_questions = ``.split(','),
flirty_questions = ``.split(','),
dirty_questions = `?`.split(','),
dare_normal_questions = ``.split(','),
more_normal_dare_questions = ``.split(','),
dirty_dare_questions_part_2 = `.`.split(','),
dirty_dare_questions_part_1 = `.`.split(',');
function dare(){
  const all_questions = [dare_normal_questions, more_normal_dare_questions, dirty_dare_questions_part_1, dirty_dare_questions_part_2], question_pack = all_questions[Math.floor(Math.random() * all_questions.length)], question = question_pack[Math.floor(Math.random() * question_pack.length)];
  return question;
}
function truth(){
  const all_questions = [embarrassing_questions_truth, truth_girl_questions, tord_friend_questions, truth_guy_questions, flirty_questions, dirty_questions], question_pack = all_questions[Math.floor(Math.random() * all_questions.length)], question = question_pack[Math.floor(Math.random() * question_pack.length)];
  return question;
}
function random_question(){
  const all_questions = [embarrassing_questions_truth, truth_girl_questions, tord_friend_questions, truth_guy_questions, flirty_questions, dirty_questions, dare_normal_questions, more_normal_dare_questions, dirty_dare_questions_part_1, dirty_dare_questions_part_2], question_pack = all_questions[Math.floor(Math.random() * all_questions.length)], question = question_pack[Math.floor(Math.random() * question_pack.length)];
  return question;
}
function amount_of_questions(type){
  if(type === 0){
    const all_questions = [embarrassing_questions_truth, truth_girl_questions, tord_friend_questions, truth_guy_questions, flirty_questions, dirty_questions, dare_normal_questions, more_normal_dare_questions, dirty_dare_questions_part_1, dirty_dare_questions_part_2];
    let amount = 0;
    for(const question_pack of all_questions){
      amount += question_pack.length;
    }
    return amount;
  }else if(type === 1){
    const truth_questions = [embarrassing_questions_truth, truth_girl_questions, tord_friend_questions, truth_guy_questions, flirty_questions, dirty_questions];
    let amount = 0;
    for(const question_pack of truth_questions){
      amount += question_pack.length;
    }
    return amount;
  }else if(type === 2){
    const dare_questions = [dare_normal_questions, more_normal_dare_questions, dirty_dare_questions_part_1, dirty_dare_questions_part_2];
    let amount = 0;
    for(const question_pack of dare_questions){
      amount += question_pack.length;
    }
    return amount;
  }else return null;
}
module.exports = {
  dare,
  truth,
  random_question,
  amount_of_questions
}
